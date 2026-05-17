import { callClaude, parseJson } from "./claude";
import {
  FABRICATION_GUARD_SYSTEM,
  OUTPUT_SYSTEM,
} from "./prompts";
import type { TailoredOutput } from "./types";

interface GuardVerdict {
  verdict: "PASS" | "FAIL";
  flaggedBullets: { index: number; reason: string }[];
}

export interface RunOutputFlowArgs {
  apiKey: string;
  resume: string;
  jd: string;
  intakeAnswers: { question: string; answer: string }[];
}

const MAX_GUARD_RETRIES = 1;

function flattenBullets(output: TailoredOutput): { text: string; company: string; idx: number }[] {
  const out: { text: string; company: string; idx: number }[] = [];
  let i = 0;
  for (const role of output.experience ?? []) {
    for (const b of role.bullets ?? []) {
      out.push({ text: b.rewritten, company: role.company, idx: i });
      i += 1;
    }
  }
  return out;
}

function buildUserPrompt(
  args: RunOutputFlowArgs,
  flaggedFeedback: { index: number; reason: string }[] = [],
): string {
  const { resume, jd, intakeAnswers } = args;
  const intakeBlock = intakeAnswers
    .map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer}`)
    .join("\n\n");

  const feedback =
    flaggedFeedback.length > 0
      ? `\n\nPRIOR ATTEMPT WAS REJECTED. The following bullets fabricated content not present in the resume or intake answers. Regenerate them using ONLY supported content. Tighten if you must drop a claim.\n${flaggedFeedback
          .map((f) => `- Bullet #${f.index + 1}: ${f.reason}`)
          .join("\n")}`
      : "";

  return `Resume:
"""
${resume}
"""

Job description:
"""
${jd}
"""

Intake answers:
"""
${intakeBlock}
"""${feedback}

Produce the tailored output JSON per the schema. Preserve every job from the resume as its own experience entry with company, title, dates, bullets.`;
}

export async function runOutputFlow(
  args: RunOutputFlowArgs,
): Promise<{ output: TailoredOutput; guarded: boolean; attempts: number }> {
  let attempt = 0;
  let lastFlags: { index: number; reason: string }[] = [];
  let output: TailoredOutput | null = null;

  while (attempt <= MAX_GUARD_RETRIES) {
    const userPrompt = buildUserPrompt(args, lastFlags);
    const text = await callClaude({
      apiKey: args.apiKey,
      task: "output",
      system: OUTPUT_SYSTEM,
      user: userPrompt,
    });
    const parsed = parseJson<TailoredOutput>(text);
    if (!parsed) {
      throw new Error("Output model returned unparseable JSON.");
    }
    output = parsed;

    const flat = flattenBullets(parsed);
    const guardText = await callClaude({
      apiKey: args.apiKey,
      task: "fabrication_guard",
      system: FABRICATION_GUARD_SYSTEM,
      user: `Original resume:
"""
${args.resume}
"""

Intake answers:
"""
${args.intakeAnswers
  .map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer}`)
  .join("\n\n")}
"""

Proposed tailored bullets (numbered, grouped by company):
${flat.map((f) => `Bullet ${f.idx} [${f.company}]: ${f.text}`).join("\n")}

Return STRICT JSON only.`,
    });

    const verdict = parseJson<GuardVerdict>(guardText);
    if (!verdict || verdict.verdict === "PASS") {
      return { output: parsed, guarded: true, attempts: attempt + 1 };
    }
    lastFlags = verdict.flaggedBullets ?? [];
    attempt += 1;
  }

  if (!output) throw new Error("No output produced.");
  return { output, guarded: false, attempts: attempt };
}
