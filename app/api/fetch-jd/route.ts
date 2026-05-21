import { NextResponse } from "next/server";
import { consumeQuota } from "@/lib/ratelimit";
import type { FetchJdResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

const ALLOWLIST_HOSTS = [
  "linkedin.com",
  "indeed.com",
  "glassdoor.com",
  "greenhouse.io",
  "boards.greenhouse.io",
  "job-boards.greenhouse.io",
  "lever.co",
  "jobs.lever.co",
  "workday.com",
  "myworkdayjobs.com",
  "ashbyhq.com",
  "jobs.ashbyhq.com",
  "workable.com",
  "apply.workable.com",
];

function isAllowedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (ALLOWLIST_HOSTS.some((h) => lower === h || lower.endsWith(`.${h}`))) {
    return true;
  }
  if (
    lower.startsWith("careers.") ||
    lower.startsWith("jobs.") ||
    lower.includes(".careers.") ||
    lower.includes("/careers")
  ) {
    return true;
  }
  return false;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function stripHtml(html: string): string {
  let s = html.replace(/<script[\s\S]*?<\/script>/gi, " ");
  s = s.replace(/<style[\s\S]*?<\/style>/gi, " ");
  s = s.replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  s = s.replace(/<nav[\s\S]*?<\/nav>/gi, " ");
  s = s.replace(/<header[\s\S]*?<\/header>/gi, " ");
  s = s.replace(/<footer[\s\S]*?<\/footer>/gi, " ");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<\/(p|div|li|h[1-6]|tr|section)>/gi, "\n");
  s = s.replace(/<[^>]+>/g, " ");
  s = decodeEntities(s);
  s = s.replace(/[ \t]+/g, " ");
  s = s.replace(/\n[ \t]+/g, "\n");
  s = s.replace(/[ \t]+\n/g, "\n");
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

function removeBoilerplate(text: string): string {
  const boilerplatePatterns = [
    /^(apply now|apply for this job|share this job|save this job)$/gim,
    /^(sign in|log in|create account|join now)$/gim,
    /accept (all )?cookies/gi,
    /this site uses cookies/gi,
  ];
  let cleaned = text;
  for (const re of boilerplatePatterns) {
    cleaned = cleaned.replace(re, "");
  }
  return cleaned.replace(/\n{3,}/g, "\n\n").trim();
}

interface JsonLdJobPosting {
  description?: string;
  title?: string;
  hiringOrganization?: { name?: string } | string;
  jobLocation?: unknown;
}

function extractJsonLd(html: string): JsonLdJobPosting | null {
  const scriptRe =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = scriptRe.exec(html)) !== null) {
    try {
      const raw = m[1].trim();
      const parsed = JSON.parse(raw);
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      for (const c of candidates) {
        if (!c) continue;
        if (c["@graph"] && Array.isArray(c["@graph"])) {
          for (const g of c["@graph"]) {
            if (g?.["@type"] === "JobPosting") return g as JsonLdJobPosting;
          }
        }
        if (c["@type"] === "JobPosting") return c as JsonLdJobPosting;
      }
    } catch {
      // Ignore malformed JSON-LD blocks
    }
  }
  return null;
}

function extractByPlatform(
  html: string,
  hostname: string,
): { text: string; selector: string } | null {
  const selectors: { host: RegExp; patterns: RegExp[] }[] = [
    {
      host: /linkedin\.com/,
      patterns: [
        /<div[^>]+class="[^"]*show-more-less-html__markup[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
        /<div[^>]+class="[^"]*description__text[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      ],
    },
    {
      host: /indeed\.com/,
      patterns: [
        /<div[^>]+id="jobDescriptionText"[^>]*>([\s\S]*?)<\/div>\s*(?=<div|<section|<footer|$)/i,
        /<div[^>]+class="[^"]*jobsearch-JobComponent-description[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?=<div|<section|<footer|$)/i,
      ],
    },
    {
      host: /glassdoor\.com/,
      patterns: [
        /<div[^>]+class="[^"]*jobDescriptionContent[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      ],
    },
    {
      host: /greenhouse\.io/,
      patterns: [
        /<div[^>]+id="content"[^>]*>([\s\S]*?)<\/div>\s*(?=<div|<section|<footer|$)/i,
        /<div[^>]+class="[^"]*job__description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      ],
    },
    {
      host: /lever\.co/,
      patterns: [
        /<div[^>]+class="[^"]*posting-page[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?=<div|<section|<footer|$)/i,
        /<div[^>]+class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      ],
    },
    {
      host: /workday\.com|myworkdayjobs\.com/,
      patterns: [/<div[^>]+data-automation-id="jobPostingDescription"[^>]*>([\s\S]*?)<\/div>/i],
    },
    {
      host: /ashbyhq\.com/,
      patterns: [/<div[^>]+class="[^"]*_description[^"]*"[^>]*>([\s\S]*?)<\/div>/i],
    },
    {
      host: /workable\.com/,
      patterns: [/<section[^>]+data-ui="job-description"[^>]*>([\s\S]*?)<\/section>/i],
    },
  ];

  for (const s of selectors) {
    if (!s.host.test(hostname)) continue;
    for (const p of s.patterns) {
      const m = html.match(p);
      if (m && m[1]) {
        return { text: stripHtml(m[1]), selector: s.host.source };
      }
    }
  }
  return null;
}

function genericExtract(html: string): string {
  let body = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  if (!body) {
    body = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1];
  }
  if (!body) {
    body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;
  }
  return stripHtml(body);
}

function detectLinkedInLoginWall(html: string, finalUrl: string): boolean {
  if (/\/login|\/authwall|\/checkpoint/i.test(finalUrl)) return true;
  if (/sign in to view this job/i.test(html)) return true;
  if (/<title>[^<]*Sign In[^<]*<\/title>/i.test(html)) return true;
  return false;
}

export async function POST(req: Request) {
  const quota = await consumeQuota(req);
  if (!quota.allowed) {
    const resp: FetchJdResponse = {
      success: false,
      error: "Daily limit reached for this IP. Come back tomorrow.",
    };
    return NextResponse.json(resp, { status: 429 });
  }

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    const resp: FetchJdResponse = { success: false, error: "Invalid JSON body." };
    return NextResponse.json(resp, { status: 400 });
  }

  const urlStr = (body.url ?? "").trim();
  if (!urlStr) {
    const resp: FetchJdResponse = { success: false, error: "URL is required." };
    return NextResponse.json(resp, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlStr);
  } catch {
    const resp: FetchJdResponse = {
      success: false,
      error: "Invalid URL. Include https:// at the start.",
    };
    return NextResponse.json(resp, { status: 400 });
  }
  if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
    const resp: FetchJdResponse = {
      success: false,
      error: "Only http:// and https:// URLs are supported.",
    };
    return NextResponse.json(resp, { status: 400 });
  }

  if (!isAllowedHost(parsedUrl.hostname)) {
    const resp: FetchJdResponse = {
      success: false,
      error: `${parsedUrl.hostname} is not in the supported list. Try LinkedIn, Indeed, Glassdoor, a company careers page, or paste the description below.`,
    };
    return NextResponse.json(resp, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ResumeVerdict/1.0; +https://resumeverdict.app)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(10000),
      redirect: "follow",
    });
  } catch (err) {
    const isTimeout =
      err instanceof DOMException && err.name === "TimeoutError";
    const resp: FetchJdResponse = {
      success: false,
      error: isTimeout
        ? "The page took too long to load. Try pasting the job description text directly."
        : "Couldn't reach that URL. Try pasting the job description text directly.",
    };
    return NextResponse.json(resp, { status: 502 });
  }

  if (!res.ok) {
    const isLinkedIn = /linkedin\.com/i.test(parsedUrl.hostname);
    const resp: FetchJdResponse = {
      success: false,
      error:
        isLinkedIn && (res.status === 401 || res.status === 403 || res.status === 999)
          ? "LinkedIn requires login to view this posting. Open the posting, copy the job description text, and paste it below."
          : `Couldn't fetch the page (HTTP ${res.status}). Try pasting the job description text directly.`,
    };
    return NextResponse.json(resp, { status: 502 });
  }

  const html = await res.text();

  if (
    /linkedin\.com/i.test(parsedUrl.hostname) &&
    detectLinkedInLoginWall(html, res.url)
  ) {
    const resp: FetchJdResponse = {
      success: false,
      error:
        "LinkedIn requires login to view this posting. Open the posting, copy the job description text, and paste it below.",
    };
    return NextResponse.json(resp, { status: 200 });
  }

  let jdText = "";
  let confidence: "high" | "medium" | "low" = "low";
  let jobTitle: string | undefined;
  let company: string | undefined;
  let message: string | undefined;

  const jsonLd = extractJsonLd(html);
  if (jsonLd?.description) {
    jdText = stripHtml(jsonLd.description);
    confidence = "high";
    if (typeof jsonLd.title === "string") jobTitle = jsonLd.title;
    if (typeof jsonLd.hiringOrganization === "string") {
      company = jsonLd.hiringOrganization;
    } else if (
      jsonLd.hiringOrganization &&
      typeof jsonLd.hiringOrganization === "object" &&
      "name" in jsonLd.hiringOrganization
    ) {
      company = (jsonLd.hiringOrganization as { name?: string }).name;
    }
  }

  if (!jdText) {
    const platform = extractByPlatform(html, parsedUrl.hostname);
    if (platform && platform.text.length >= 50) {
      jdText = platform.text;
      confidence = "high";
    }
  }

  if (!jdText) {
    const generic = genericExtract(html);
    if (generic.length >= 200) {
      jdText = generic;
      confidence = "medium";
      message =
        "Extraction may be incomplete. Please review and edit the text below.";
    } else if (generic.length >= 50) {
      jdText = generic;
      confidence = "low";
      message =
        "We extracted what we could. Please verify the text below and edit if needed.";
    }
  }

  jdText = removeBoilerplate(jdText);

  if (jdText.length < 50) {
    const resp: FetchJdResponse = {
      success: false,
      error:
        "Couldn't extract enough text from that URL. Try pasting the job description text directly.",
    };
    return NextResponse.json(resp, { status: 200 });
  }

  const resp: FetchJdResponse = {
    success: true,
    jdText,
    jobTitle,
    company,
    confidence,
    message,
  };
  return NextResponse.json(resp);
}
