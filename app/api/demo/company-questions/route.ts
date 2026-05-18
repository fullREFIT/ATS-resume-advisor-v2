import { NextResponse } from "next/server";
import { callClaude, classifyError, parseJson } from "@/lib/claude";
import { COMPANY_QUESTIONS_SYSTEM } from "@/lib/prompts";
import { consumeQuota, rateLimitWarning } from "@/lib/ratelimit";
import type { CompanyFit, QuestionsResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    companyFit?: CompanyFit;
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
  const fit = body.companyFit;
  const desiredRole = (body.desiredRole ?? "").slice(0, 200).trim();

  if (resume.length < 50 || companyContent.length < 200 || !fit) {
    return NextResponse.json(
      { error: "Missing resume, company content, or fit analysis." },
      { status: 400 },
    );
  }

  const userPrompt = `Candidate resume:
"""
${resume}
"""

Company website content:
"""
${companyContent}
"""

Company-fit analysis (already produced):
${JSON.stringify(
  {
    companyName: fit.companyName,
    valuesObserved: fit.valuesObserved,
    rolesLikelyHired: fit.rolesLikelyHired,
    whereBackgroundMaps: fit.whereBackgroundMaps,
    outreachGaps: fit.outreachGaps,
  },
  null,
  2,
)}

${desiredRole ? `Candidate's desired role: ${desiredRole}\n\n` : ""}Generate exactly 5 Socratic intake questions targeting this specific candidate and this specific company. Return STRICT JSON only.`;

  try {
    const text = await callClaude({
      apiKey,
      task: "questions",
      system: COMPANY_QUESTIONS_SYSTEM,
      user: userPrompt,
    });
    const parsed = parseJson<QuestionsResponse>(text);
    if (!parsed || !Array.isArray(parsed.questions)) {
      return NextResponse.json(
        { error: "Model returned an unparseable response. Try again." },
        { status: 502 },
      );
    }
    return NextResponse.json({ questions: parsed, rateLimit: quota, rateLimitEnforced: quota.enforced, warning: rateLimitWarning(quota) });
  } catch (err) {
    const c = classifyError(err);
    return NextResponse.json(
      { error: c.message },
      { status: c.status >= 400 && c.status < 600 ? c.status : 500 },
    );
  }
}
