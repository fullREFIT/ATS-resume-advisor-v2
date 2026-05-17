import { NextResponse } from "next/server";
import { classifyError } from "@/lib/claude";
import { runOutputFlow } from "@/lib/output-flow";
import { consumeQuota } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_INPUT_CHARS = 30000;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is not configured." },
      { status: 500 },
    );
  }

  const quota = await consumeQuota(req);
  if (!quota.allowed) {
    return NextResponse.json(
      { error: "Daily limit reached.", rateLimit: quota },
      { status: 429 },
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
      resume,
      jd,
      intakeAnswers,
    });
    return NextResponse.json({
      output: result.output,
      guarded: result.guarded,
      attempts: result.attempts,
      rateLimit: quota,
    });
  } catch (err) {
    const c = classifyError(err);
    return NextResponse.json(
      { error: c.message },
      { status: c.status >= 400 && c.status < 600 ? c.status : 500 },
    );
  }
}
