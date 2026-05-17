import { NextResponse } from "next/server";
import { classifyError } from "@/lib/claude";
import { runCompanyOutputFlow } from "@/lib/company-output-flow";
import { consumeQuota } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_RESUME_CHARS = 30000;
const MAX_COMPANY_CHARS = 20000;

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
    companyContent?: string;
    companyUrl?: string;
    desiredRole?: string;
    intakeAnswers?: { question: string; answer: string }[];
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
  const intakeAnswers = Array.isArray(body.intakeAnswers)
    ? body.intakeAnswers
        .map((a) => ({
          question: String(a.question ?? "").slice(0, 1000),
          answer: String(a.answer ?? "").slice(0, 4000),
        }))
        .filter((a) => a.answer.trim().length > 0)
    : [];

  if (
    resume.length < 50 ||
    companyContent.length < 200 ||
    intakeAnswers.length < 1
  ) {
    return NextResponse.json(
      { error: "Missing resume, company content, or intake answers." },
      { status: 400 },
    );
  }

  try {
    const result = await runCompanyOutputFlow({
      apiKey,
      resume,
      companyContent,
      companyUrl,
      desiredRole: desiredRole || undefined,
      intakeAnswers,
    });
    return NextResponse.json({
      output: result.output,
      bulletGuardPassed: result.bulletGuardPassed,
      companyGuardPassed: result.companyGuardPassed,
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
