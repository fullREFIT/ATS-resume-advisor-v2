import { NextResponse } from "next/server";
import { callClaude, classifyError, parseJson } from "@/lib/claude";
import { COVER_LETTER_SYSTEM, FABRICATION_GUARD_SYSTEM } from "@/lib/prompts";
import { consumeQuota } from "@/lib/ratelimit";
import type { CoverLetterOutput } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface GuardVerdict {
  verdict: "PASS" | "FAIL";
  flaggedClaims: { location: string; claim: string; reason: string }[];
}

type RoleBody = {
  mode: "role";
  resume: string;
  jd: string;
  intakeAnswers: { question: string; answer: string }[];
};

type CompanyBody = {
  mode: "company";
  resume: string;
  companyContent: string;
  companyUrl: string;
  intakeAnswers: { question: string; answer: string }[];
};

type Body = RoleBody | CompanyBody;

function buildUserPrompt(body: Body): string {
  const intakeBlock = (body.intakeAnswers ?? [])
    .map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer}`)
    .join("\n\n");

  if (body.mode === "company") {
    return `Resume:
"""
${body.resume}
"""

Company website content:
"""
${body.companyContent}
"""

Company URL: ${body.companyUrl}

Intake answers:
"""
${intakeBlock}
"""

Write a targeted cover letter for cold outreach to this company. Return STRICT JSON only.`;
  }

  return `Resume:
"""
${body.resume}
"""

Job description:
"""
${body.jd}
"""

Intake answers:
"""
${intakeBlock}
"""

Write a targeted cover letter for this specific role. Return STRICT JSON only.`;
}

function buildGuardPrompt(
  body: Body,
  coverLetter: string,
): string {
  const intakeBlock = (body.intakeAnswers ?? [])
    .map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer}`)
    .join("\n\n");

  return `Original resume:
"""
${body.resume}
"""

Intake answers:
"""
${intakeBlock}
"""

Cover letter to check:
"""
${coverLetter}
"""

Flag any claims in the cover letter that are NOT supported by the resume or intake answers above. Return STRICT JSON only.`;
}

export async function POST(req: Request) {
  const quota = await consumeQuota(req);
  if (!quota.allowed) {
    return NextResponse.json(
      { error: "Daily limit reached. Try again tomorrow." },
      { status: 429 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured." },
      { status: 500 },
    );
  }

  let body: Body;
  try {
    body = await req.json() as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body.resume || body.resume.trim().length < 50) {
    return NextResponse.json({ error: "Resume is required." }, { status: 400 });
  }

  try {
    const userPrompt = buildUserPrompt(body);

    // Generation (Sonnet)
    let text = await callClaude({
      apiKey,
      task: "output",
      system: COVER_LETTER_SYSTEM,
      user: userPrompt,
      maxTokens: 2000,
    });

    let output = parseJson<CoverLetterOutput>(text);
    if (!output) {
      return NextResponse.json(
        { error: "Failed to parse cover letter output." },
        { status: 500 },
      );
    }

    // Fabrication guard (Haiku)
    const guardText = await callClaude({
      apiKey,
      task: "fabrication_guard",
      system: FABRICATION_GUARD_SYSTEM,
      user: buildGuardPrompt(body, output.coverLetter),
      maxTokens: 800,
    });

    const guardVerdict = parseJson<GuardVerdict>(guardText);
    if (guardVerdict && guardVerdict.verdict === "FAIL" && guardVerdict.flaggedClaims.length > 0) {
      // One retry with feedback
      const feedback = guardVerdict.flaggedClaims
        .map((f) => `- ${f.location}: "${f.claim}" — ${f.reason}`)
        .join("\n");

      const retryPrompt =
        buildUserPrompt(body) +
        `\n\nPRIOR ATTEMPT WAS REJECTED BY FACT-CHECK. These claims are not supported by the source materials:\n${feedback}\n\nRewrite the cover letter without these claims. Every sentence must be supported by the resume or intake answers.`;

      text = await callClaude({
        apiKey,
        task: "output",
        system: COVER_LETTER_SYSTEM,
        user: retryPrompt,
        maxTokens: 2000,
      });

      output = parseJson<CoverLetterOutput>(text) ?? output;
    }

    return NextResponse.json({ coverLetter: output });
  } catch (err) {
    const ce = classifyError(err);
    return NextResponse.json({ error: ce.message }, { status: ce.status });
  }
}
