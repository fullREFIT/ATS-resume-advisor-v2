import { NextResponse } from "next/server";
import { callClaude, classifyError, parseJson, getProviderApiKey } from "@/lib/claude";
import { RECRUITER_SCAN_SYSTEM } from "@/lib/prompts";
import { consumeQuota, consumeBudget, estimateRequestCost, budgetExhaustedMessage, consumeQuotaUnless, consumeBudgetUnless, consumeUnlockToken } from "@/lib/ratelimit";
import type { RecruiterScan } from "@/lib/types";
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

  const budget = await consumeBudgetUnless(skipMetering, estimateRequestCost("fabrication_guard"));
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

  let body: { resumeText: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const resumeText = (body.resumeText ?? "").trim();
  if (resumeText.length < 50) {
    return NextResponse.json(
      { error: "Resume text too short." },
      { status: 400 },
    );
  }

  try {
    const text = await callClaude({
      apiKey,
      providerOverride: byokKey ? "anthropic" : undefined,
      task: "diagnosis",
      system: RECRUITER_SCAN_SYSTEM,
      user: `Here is the tailored resume to scan:\n\n"""\n${resumeText}\n"""`,
      maxTokens: 1200,
    });
    const scan = parseJson<RecruiterScan>(text);
    if (!scan) {
      return NextResponse.json(
        { error: "Failed to parse recruiter scan." },
        { status: 500 },
      );
    }
    return NextResponse.json({ scan });
  } catch (err) {
    const ce = classifyError(err);
    return NextResponse.json({ error: ce.message }, { status: ce.status });
  }
}
