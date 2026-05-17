import { NextResponse } from "next/server";
import { callClaude, classifyError, parseJson } from "@/lib/claude";
import { QUESTIONS_SYSTEM } from "@/lib/prompts";
import { consumeQuota } from "@/lib/ratelimit";
import type { Diagnosis, QuestionsResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  let body: { resume?: string; jd?: string; diagnosis?: Diagnosis };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const resume = (body.resume ?? "").slice(0, MAX_INPUT_CHARS).trim();
  const jd = (body.jd ?? "").slice(0, MAX_INPUT_CHARS).trim();
  const diagnosis = body.diagnosis;
  if (resume.length < 50 || jd.length < 50 || !diagnosis) {
    return NextResponse.json(
      { error: "Missing resume, JD, or diagnosis." },
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

Diagnosis JSON:
${JSON.stringify(
  {
    matchScore: diagnosis.matchScore,
    verdict: diagnosis.verdict,
    topMatches: diagnosis.topMatches,
    criticalGaps: diagnosis.criticalGaps,
  },
  null,
  2,
)}

Generate exactly 5 Socratic intake questions targeting the gaps and claimed-vs-demonstrated weak spots. Return STRICT JSON only.`;

  try {
    const text = await callClaude({
      apiKey,
      task: "questions",
      system: QUESTIONS_SYSTEM,
      user: userPrompt,
    });
    const parsed = parseJson<QuestionsResponse>(text);
    if (!parsed || !Array.isArray(parsed.questions)) {
      return NextResponse.json(
        { error: "Model returned an unparseable response. Try again." },
        { status: 502 },
      );
    }
    return NextResponse.json({ questions: parsed, rateLimit: quota });
  } catch (err) {
    const c = classifyError(err);
    return NextResponse.json(
      { error: c.message },
      { status: c.status >= 400 && c.status < 600 ? c.status : 500 },
    );
  }
}
