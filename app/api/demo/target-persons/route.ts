import { NextResponse } from "next/server";
import { callClaude, classifyError, parseJson, getProviderApiKey } from "@/lib/claude";
import { TARGET_PERSONS_SYSTEM } from "@/lib/prompts";
import { consumeQuota, rateLimitWarning, consumeQuotaUnlessByok, consumeBudget, consumeBudgetUnlessByok, estimateRequestCost, budgetExhaustedMessage } from "@/lib/ratelimit";
import type { TargetPersonsResponse } from "@/lib/types";
import { extractByokKey } from "@/lib/byok-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_RESUME_CHARS = 30000;
const MAX_COMPANY_CHARS = 20000;
const MAX_LIST_ITEMS = 20;
const MAX_LIST_ITEM_CHARS = 500;
const MAX_FREE_TEXT = 4000;

function cleanList(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, MAX_LIST_ITEMS)
    .map((s) => String(s ?? "").slice(0, MAX_LIST_ITEM_CHARS).trim())
    .filter((s) => s.length > 0);
}

export async function POST(req: Request) {
  const byokKey = extractByokKey(req);
  const apiKey = byokKey ?? getProviderApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is not configured." },
      { status: 500 },
    );
  }

  const quota = await consumeQuotaUnlessByok(req, byokKey);
  if (!quota.allowed) {
    return NextResponse.json(
      { error: "Daily limit reached.", rateLimit: quota },
      { status: 429 },
    );
  }

  const budget = await consumeBudgetUnlessByok(byokKey, estimateRequestCost("fabrication_guard"));
  if (!budget.allowed) {
    return NextResponse.json(
      { error: budgetExhaustedMessage(), budget },
      { status: 503 },
    );
  }

  let body: {
    resume?: string;
    companyContent?: string;
    companyName?: string;
    valuesObserved?: unknown;
    positioning?: string;
    draftMessage?: string;
    companyHooksUsed?: unknown;
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
  const companyName = (body.companyName ?? "").slice(0, 200).trim();
  const valuesObserved = cleanList(body.valuesObserved);
  const positioning = (body.positioning ?? "").slice(0, MAX_FREE_TEXT).trim();
  const draftMessage = (body.draftMessage ?? "").slice(0, MAX_FREE_TEXT).trim();
  const companyHooksUsed = cleanList(body.companyHooksUsed);

  if (
    resume.length < 50 ||
    companyContent.length < 200 ||
    companyName.length < 1 ||
    positioning.length < 20 ||
    draftMessage.length < 20 ||
    companyHooksUsed.length < 1
  ) {
    return NextResponse.json(
      {
        error:
          "Missing resume, company content, company name, positioning, draft message, or company hooks.",
      },
      { status: 400 },
    );
  }

  const userPrompt = `Candidate resume:
"""
${resume}
"""

Company name: ${companyName}

Company website content (the upstream-validated source of truth):
"""
${companyContent}
"""

Pre-validated company hooks (your opening lines may reference AT MOST ONE of these per archetype; do NOT introduce new company facts):
${companyHooksUsed.map((h, i) => `${i + 1}. ${h}`).join("\n")}

Values observed at this company:
${valuesObserved.map((v) => `- ${v}`).join("\n")}

Candidate's existing cold-outreach positioning:
"""
${positioning}
"""

Candidate's existing cold-outreach draft message:
"""
${draftMessage}
"""

Produce 3-5 target-person archetypes per the schema.`;

  try {
    const text = await callClaude({
      apiKey,
      providerOverride: byokKey ? "anthropic" : undefined,
      task: "questions",
      system: TARGET_PERSONS_SYSTEM,
      user: userPrompt,
    });
    const parsed = parseJson<TargetPersonsResponse>(text);
    if (!parsed || !Array.isArray(parsed.archetypes)) {
      console.error("[target-persons] Failed to parse model output. Raw text:", text);
      return NextResponse.json(
        { error: "Model returned unparseable response." },
        { status: 502 },
      );
    }
    return NextResponse.json({
      archetypes: parsed.archetypes,
      rateLimit: quota,
      rateLimitEnforced: quota.enforced,
      warning: rateLimitWarning(quota),
    });
  } catch (err) {
    const c = classifyError(err);
    return NextResponse.json(
      { error: c.message },
      { status: c.status >= 400 && c.status < 600 ? c.status : 500 },
    );
  }
}
