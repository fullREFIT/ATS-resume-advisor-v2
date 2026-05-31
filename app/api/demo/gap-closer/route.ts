import { NextResponse } from "next/server";
import { callClaude, classifyError, parseJson, getProviderApiKey } from "@/lib/claude";
import { GAP_CLOSER_SYSTEM } from "@/lib/prompts";
import { consumeQuota, consumeBudget, estimateRequestCost, budgetExhaustedMessage, consumeQuotaUnless, consumeBudgetUnless, consumeUnlockToken } from "@/lib/ratelimit";
import type { Diagnosis, GapCloserPlan } from "@/lib/types";
import { extractByokKey } from "@/lib/byok-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: Request) {
  const byokKey = extractByokKey(req);
  const unlock = await consumeUnlockToken(req);
  const skipMetering = !!byokKey || unlock.valid;
  const quota = await consumeQuotaUnless(req, skipMetering);
  if (!quota.allowed) {
    return NextResponse.json(
      { error: "Daily limit reached. Try again tomorrow." },
      { status: 429 },
    );
  }

  const budget = await consumeBudgetUnless(skipMetering, estimateRequestCost("output"));
  if (!budget.allowed) {
    return NextResponse.json(
      { error: budgetExhaustedMessage(), budget },
      { status: 503 },
    );
  }

  const apiKey = byokKey ?? getProviderApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured." },
      { status: 500 },
    );
  }

  let body: { resume: string; jd: string; diagnosis: Diagnosis };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const resume = (body.resume ?? "").trim();
  const jd = (body.jd ?? "").trim();
  const diagnosis = body.diagnosis;

  if (resume.length < 50 || jd.length < 50 || !diagnosis) {
    return NextResponse.json(
      { error: "Resume, JD, and diagnosis are required." },
      { status: 400 },
    );
  }

  const userPrompt = `Resume:
"""
${resume}
"""

Job description:
"""
${jd}
"""

Diagnosis (JSON):
"""
${JSON.stringify(diagnosis, null, 2)}
"""

The candidate's verdict is ${diagnosis.verdict} with a match score of ${diagnosis.matchScore}/100. Build a specific 30/60/90-day action plan to close the gap.`;

  try {
    const text = await callClaude({
      apiKey,
      providerOverride: byokKey ? "anthropic" : undefined,
      task: "diagnosis",
      system: GAP_CLOSER_SYSTEM,
      user: userPrompt,
      maxTokens: 3000,
    });
    const plan = parseJson<GapCloserPlan>(text);
    if (!plan) {
      console.error("[gap-closer] Failed to parse model output. Raw text:", text);
      return NextResponse.json(
        { error: "Failed to parse gap closer plan." },
        { status: 500 },
      );
    }
    return NextResponse.json({ plan });
  } catch (err) {
    const ce = classifyError(err);
    return NextResponse.json({ error: ce.message }, { status: ce.status });
  }
}
