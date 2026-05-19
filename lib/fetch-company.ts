import "server-only";

const MAX_CHARS = 18000;
const FETCH_TIMEOUT_MS = 8000;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Disallowed hosts: scrapers blocked, paywalled, or aggressively rate-limited.
const BLOCKED_HOSTS = [
  /(^|\.)linkedin\.com$/i,
  /(^|\.)facebook\.com$/i,
  /(^|\.)instagram\.com$/i,
  /(^|\.)x\.com$/i,
  /(^|\.)twitter\.com$/i,
];

interface CacheEntry {
  text: string;
  fetchedAt: number;
}
const cache = new Map<string, CacheEntry>();

export interface FetchCompanyResult {
  url: string;
  text: string;
  charCount: number;
  fetchedAt: number;
  warning?: string;
}

function normalizeUrl(raw: string): URL {
  let candidate = raw.trim();
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }
  return new URL(candidate);
}

function isBlocked(host: string): boolean {
  return BLOCKED_HOSTS.some((re) => re.test(host));
}

function stripHtml(html: string): string {
  // Remove script/style/noscript blocks entirely.
  let out = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ");

  // Replace block tags with newlines so paragraph structure survives.
  out = out.replace(
    /<\/(p|div|section|article|li|h1|h2|h3|h4|h5|h6|tr|br)>/gi,
    "\n",
  );

  // Remove remaining tags.
  out = out.replace(/<[^>]+>/g, " ");

  // Decode the most common entities.
  out = out
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");

  // Collapse whitespace.
  out = out.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  return out;
}

export async function fetchCompany(rawUrl: string): Promise<FetchCompanyResult> {
  let parsed: URL;
  try {
    parsed = normalizeUrl(rawUrl);
  } catch {
    throw new Error("That doesn't look like a valid URL.");
  }
  if (!/^https?:$/.test(parsed.protocol)) {
    throw new Error("Only http and https URLs are supported.");
  }
  if (isBlocked(parsed.host)) {
    throw new Error(
      `${parsed.host} blocks automated reads. Use the company's own website (their About page or homepage) instead.`,
    );
  }

  const key = parsed.toString();
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return {
      url: key,
      text: cached.text,
      charCount: cached.text.length,
      fetchedAt: cached.fetchedAt,
    };
  }

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(key, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ResumeVerdict/1.0; +https://resumeverdict.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(
        "That site took too long to respond. Try a different URL or paste the About page text directly.",
      );
    }
    throw new Error(
      "We couldn't reach that site. Check the URL or paste the About page text directly.",
    );
  } finally {
    clearTimeout(t);
  }

  if (!res.ok) {
    throw new Error(
      `That site returned HTTP ${res.status}. Try a different URL or paste the About page text directly.`,
    );
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!/text\/html|application\/xhtml/i.test(contentType)) {
    throw new Error(
      "That URL isn't an HTML page. Paste the company description text directly.",
    );
  }

  const html = await res.text();
  const text = stripHtml(html);
  const trimmed = text.slice(0, MAX_CHARS);
  const warning =
    text.length > MAX_CHARS
      ? `We read the first ${MAX_CHARS.toLocaleString()} characters from this page; longer pages are truncated.`
      : text.length < 400
        ? "We extracted very little text from this page (likely a JS-rendered site). The diagnosis may be thin — try pasting a richer page like their About or Careers page directly."
        : undefined;

  cache.set(key, { text: trimmed, fetchedAt: now });

  return {
    url: key,
    text: trimmed,
    charCount: trimmed.length,
    fetchedAt: now,
    warning,
  };
}
