import { NextResponse } from "next/server";
import { callClaude, classifyError, parseJson } from "@/lib/claude";
import { DIAGNOSIS_SYSTEM } from "@/lib/prompts";
import { consumeQuota } from "@/lib/ratelimit";
import type { Diagnosis } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_INPUT_CHARS = 30000;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is not configured. Come back later." },
      { status: 500 },
    );
  }

  const quota = await consumeQuota(req);
  if (!quota.allowed) {
    return NextResponse.json(
      {
        error: "Daily limit reached for this IP. Come back tomorrow.",
        rateLimit: quota,
      },
      { status: 429 },
    );
  }

  let body: { resume?: string; jd?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const resume = (body.resume ?? "").slice(0, MAX_INPUT_CHARS).trim();
  const jd = (body.jd ?? "").slice(0, MAX_INPUT_CHARS).trim();

  if (resume.length < 50 || jd.length < 50) {
    return NextResponse.json(
      {
        error:
          "Resume and job description must each be at least 50 characters.",
      },
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

Diagnose the gap. Return STRICT JSON only matching the schema in the system instructions.`;

  try {
    const text = await callClaude({
      apiKey,
      task: "diagnosis",
      system: DIAGNOSIS_SYSTEM,
      user: userPrompt,
    });
    const parsed = parseJson<Diagnosis>(text);
    if (!parsed) {
      return NextResponse.json(
        { error: "Model returned an unparseable response. Try again." },
        { status: 502 },
      );
    }
    return NextResponse.json({ diagnosis: parsed, rateLimit: quota });
  } catch (err) {
    const c = classifyError(err);
    return NextResponse.json(
      { error: c.message },
      { status: c.status >= 400 && c.status < 600 ? c.status : 500 },
    );
  }
}
