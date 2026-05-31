import { NextResponse } from "next/server";
import { classifyError, getProviderApiKey } from "@/lib/claude";
import { runOutputFlow } from "@/lib/output-flow";
import { consumeQuota, rateLimitWarning, consumeBudget, estimateRequestCost, budgetExhaustedMessage, consumeQuotaUnless, consumeBudgetUnless, consumeUnlockToken } from "@/lib/ratelimit";
import { extractByokKey } from "@/lib/byok-helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_INPUT_CHARS = 30000;

export async function POST(req: Request) {
  const byokKey = extractByokKey(req);
  const unlock = await consumeUnlockToken(req);
  const skipMetering = !!byokKey || unlock.valid;
  const apiKey = byokKey ?? getProviderApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is not configured." },
      { status: 500 },
    );
  }

  const quota = await consumeQuotaUnless(req, skipMetering);
  if (!quota.allowed) {
    return NextResponse.json(
      { error: "Daily limit reached.", rateLimit: quota },
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

  let body: {
    resume?: string;
    jd?: string;
    intakeAnswers?: { question: string; answer: string }[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const resume = (body.resume ?? "").slice(0, MAX_INPUT_CHARS).trim();
  const jd = (body.jd ?? "").slice(0, MAX_INPUT_CHARS).trim();
  const intakeAnswers = Array.isArray(body.intakeAnswers)
    ? body.intakeAnswers
        .map((a) => ({
          question: String(a.question ?? "").slice(0, 1000),
          answer: String(a.answer ?? "").slice(0, 4000),
        }))
        .filter((a) => a.answer.trim().length > 0)
    : [];

  if (resume.length < 50 || jd.length < 50 || intakeAnswers.length < 1) {
    return NextResponse.json(
      { error: "Missing resume, JD, or intake answers." },
      { status: 400 },
    );
  }

  try {
    const result = await runOutputFlow({
      apiKey,
      providerOverride: byokKey ? "anthropic" : undefined,
      resume,
      jd,
      intakeAnswers,
    });
    return NextResponse.json({
      output: result.output,
      guarded: result.guarded,
      attempts: result.attempts,
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
