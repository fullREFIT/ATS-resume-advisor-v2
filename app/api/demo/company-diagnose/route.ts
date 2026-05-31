import { NextResponse } from "next/server";
import { callClaude, classifyError, parseJson, getProviderApiKey } from "@/lib/claude";
import { COMPANY_FIT_SYSTEM } from "@/lib/prompts";
import { consumeQuota, rateLimitWarning, consumeBudget, estimateRequestCost, budgetExhaustedMessage, consumeQuotaUnless, consumeBudgetUnless, consumeUnlockToken } from "@/lib/ratelimit";
import type { CompanyFit } from "@/lib/types";
import { extractByokKey } from "@/lib/byok-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_RESUME_CHARS = 30000;
const MAX_COMPANY_CHARS = 20000;

export async function POST(req: Request) {
  const byokKey = extractByokKey(req);
  const unlock = await consumeUnlockToken(req);
  const skipMetering = !!byokKey || unlock.valid;
  const apiKey = byokKey ?? getProviderApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is not configured. Come back later." },
      { status: 500 },
    );
  }

  const quota = await consumeQuotaUnless(req, skipMetering);
  if (!quota.allowed) {
    return NextResponse.json(
      { error: "Daily limit reached for this IP. Come back tomorrow.", rateLimit: quota },
      { status: 429 },
    );
  }

  const budget = await consumeBudgetUnless(skipMetering, estimateRequestCost("diagnosis"));
  if (!budget.allowed) {
    return NextResponse.json(
      { error: budgetExhaustedMessage(), budget },
      { status: 503 },
    );
  }

  let body: {
    resume?: string;
    companyContent?: string;
    companyUrl?: string;
    desiredRole?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const resume = (body.resume ?? "").slice(0, MAX_RESUME_CHARS).trim();
  const companyContent = (body.companyContent ?? "")
    .slice(0, MAX_COMPANY_CHARS)
    .trim();
  const companyUrl = (body.companyUrl ?? "").slice(0, 500).trim();
  const desiredRole = (body.desiredRole ?? "").slice(0, 200).trim();

  if (resume.length < 50) {
    return NextResponse.json(
      { error: "Resume must be at least 50 characters." },
      { status: 400 },
    );
  }
  if (companyContent.length < 200) {
    return NextResponse.json(
      {
        error:
          "We didn't get enough content from that URL. Paste an About page or company description directly.",
      },
      { status: 400 },
    );
  }

  const userPrompt = `Candidate resume:
"""
${resume}
"""

Company website URL: ${companyUrl || "(not provided)"}

Company website content (verbatim text extracted from the site):
"""
${companyContent}
"""

${desiredRole ? `The candidate would ideally want a role like: ${desiredRole}\n\n` : ""}Analyze the fit between this candidate and this company for proactive cold outreach. Return STRICT JSON only matching the schema in the system instructions.`;

  try {
    const text = await callClaude({
      apiKey,
      providerOverride: byokKey ? "anthropic" : undefined,
      task: "diagnosis",
      system: COMPANY_FIT_SYSTEM,
      user: userPrompt,
    });
    const parsed = parseJson<CompanyFit>(text);
    if (!parsed) {
      return NextResponse.json(
        { error: "Model returned an unparseable response. Try again." },
        { status: 502 },
      );
    }
    return NextResponse.json({ fit: parsed, rateLimit: quota, rateLimitEnforced: quota.enforced, warning: rateLimitWarning(quota) });
  } catch (err) {
    const c = classifyError(err);
    return NextResponse.json(
      { error: c.message },
      { status: c.status >= 400 && c.status < 600 ? c.status : 500 },
    );
  }
}
