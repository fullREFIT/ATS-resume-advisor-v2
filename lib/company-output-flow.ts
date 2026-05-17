import { callClaude, parseJson } from "./claude";
import {
  COMPANY_FACT_CHECK_SYSTEM,
  COMPANY_OUTPUT_SYSTEM,
  FABRICATION_GUARD_SYSTEM,
} from "./prompts";
import type { CompanyTailoredOutput } from "./types";

interface BulletGuardVerdict {
  verdict: "PASS" | "FAIL";
  flaggedBullets: { index: number; reason: string }[];
}

interface CompanyGuardVerdict {
  verdict: "PASS" | "FAIL";
  flaggedClaims: {
    location: "positioning" | "draftMessage" | "summary" | "companyHooksUsed";
    claim: string;
    reason: string;
  }[];
}

export interface RunCompanyOutputFlowArgs {
  apiKey: string;
  resume: string;
  companyContent: string;
  companyUrl: string;
  desiredRole?: string;
  intakeAnswers: { question: string; answer: string }[];
}

const MAX_RETRIES = 1;

function flattenBullets(
  out: CompanyTailoredOutput,
): { text: string; company: string; idx: number }[] {
  const acc: { text: string; company: string; idx: number }[] = [];
  let i = 0;
  for (const role of out.experience ?? []) {
    for (const b of role.bullets ?? []) {
      acc.push({ text: b.rewritten, company: role.company, idx: i });
      i += 1;
    }
  }
  return acc;
}

function buildUserPrompt(
  args: RunCompanyOutputFlowArgs,
  feedback: {
    bulletFlags?: { index: number; reason: string }[];
    companyFlags?: CompanyGuardVerdict["flaggedClaims"];
  } = {},
): string {
  const intakeBlock = args.intakeAnswers
    .map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer}`)
    .join("\n\n");

  const bulletFb =
    feedback.bulletFlags && feedback.bulletFlags.length > 0
      ? `\n\nPRIOR ATTEMPT REJECTED for fabricated bullets:\n${feedback.bulletFlags
          .map((f) => `- Bullet #${f.index + 1}: ${f.reason}`)
          .join("\n")}`
      : "";
  const companyFb =
    feedback.companyFlags && feedback.companyFlags.length > 0
      ? `\n\nPRIOR ATTEMPT REJECTED for company claims not supported by site content:\n${feedback.companyFlags
          .map((f) => `- ${f.location}: ${f.claim} — ${f.reason}`)
          .join("\n")}`
      : "";

  return `Candidate resume:
"""
${args.resume}
"""

Company website URL: ${args.companyUrl}

Company website content (verbatim, the ONLY source for company facts):
"""
${args.companyContent}
"""

${args.desiredRole ? `Candidate's desired role at this company: ${args.desiredRole}\n\n` : ""}Intake answers (use as additional source material for candidate-side claims):
"""
${intakeBlock}
"""${bulletFb}${companyFb}

Produce the tailored output JSON per the schema.`;
}

export async function runCompanyOutputFlow(
  args: RunCompanyOutputFlowArgs,
): Promise<{
  output: CompanyTailoredOutput;
  bulletGuardPassed: boolean;
  companyGuardPassed: boolean;
  attempts: number;
}> {
  let attempt = 0;
  let lastBulletFlags: { index: number; reason: string }[] = [];
  let lastCompanyFlags: CompanyGuardVerdict["flaggedClaims"] = [];
  let output: CompanyTailoredOutput | null = null;

  while (attempt <= MAX_RETRIES) {
    const text = await callClaude({
      apiKey: args.apiKey,
      task: "output",
      system: COMPANY_OUTPUT_SYSTEM,
      user: buildUserPrompt(args, {
        bulletFlags: lastBulletFlags,
        companyFlags: lastCompanyFlags,
      }),
    });
    const parsed = parseJson<CompanyTailoredOutput>(text);
    if (!parsed) throw new Error("Output model returned unparseable JSON.");
    output = parsed;

    // Bullet fact-check against resume + intake
    const flat = flattenBullets(parsed);
    const bulletGuardText = await callClaude({
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

Proposed tailored bullets:
${flat.map((f) => `Bullet ${f.idx} [${f.company}]: ${f.text}`).join("\n")}

Return STRICT JSON only.`,
    });
    const bulletVerdict = parseJson<BulletGuardVerdict>(bulletGuardText);
    const bulletOk = !bulletVerdict || bulletVerdict.verdict === "PASS";

    // Company fact-check against scraped content
    const companyGuardText = await callClaude({
      apiKey: args.apiKey,
      task: "fabrication_guard",
      system: COMPANY_FACT_CHECK_SYSTEM,
      user: `Company website content (the ONLY allowed source for company claims):
"""
${args.companyContent}
"""

Proposed company-facing content:
- Summary: ${parsed.summary}
- Positioning: ${parsed.coldOutreachAngle.positioning}
- Draft message: ${parsed.coldOutreachAngle.draftMessage}
- Company hooks claimed: ${(parsed.companyHooksUsed ?? []).map((h, i) => `${i + 1}. ${h}`).join(" | ")}

Return STRICT JSON only.`,
    });
    const companyVerdict = parseJson<CompanyGuardVerdict>(companyGuardText);
    const companyOk = !companyVerdict || companyVerdict.verdict === "PASS";

    if (bulletOk && companyOk) {
      return {
        output: parsed,
        bulletGuardPassed: true,
        companyGuardPassed: true,
        attempts: attempt + 1,
      };
    }
    lastBulletFlags = bulletVerdict?.flaggedBullets ?? [];
    lastCompanyFlags = companyVerdict?.flaggedClaims ?? [];
    attempt += 1;
  }

  if (!output) throw new Error("No output produced.");
  return {
    output,
    bulletGuardPassed: lastBulletFlags.length === 0,
    companyGuardPassed: lastCompanyFlags.length === 0,
    attempts: attempt,
  };
}
