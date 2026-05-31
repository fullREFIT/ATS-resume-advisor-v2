"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/CopyButton";
import { InfoBlock } from "@/components/ui/InfoBlock";
import { InterviewPrep } from "@/components/InterviewPrep";
import { TailoredExperience } from "@/components/TailoredBullets";
import { RecruiterScanSection } from "@/components/RecruiterScan";
import { CoverLetterSection } from "@/components/CoverLetter";
import { ResumeDiff } from "@/components/ResumeDiff";
import { ApplicationPackage } from "@/components/ApplicationPackage";
import { clearSession, loadSession, saveSession } from "@/lib/storage";
import { TargetPersonsPanel } from "@/components/TargetPersonsPanel";
import { authHeaders } from "@/lib/api-fetch";
import type {
  CompanyTailoredOutput,
  IntakeMode,
  SessionState,
  TailoredOutput,
  TargetPersonArchetype,
  TargetPersonsResponse,
} from "@/lib/types";

function buildPlainTextResume(tailored: TailoredOutput | CompanyTailoredOutput): string {
  const lines: string[] = [];
  lines.push(tailored.contact.name);
  const contactParts = [
    tailored.contact.location,
    tailored.contact.phone,
    tailored.contact.email,
    tailored.contact.linkedin,
  ].filter(Boolean);
  if (contactParts.length > 0) lines.push(contactParts.join(" | "));
  lines.push("");
  lines.push("SUMMARY");
  lines.push(tailored.summary);
  lines.push("");
  lines.push("EXPERIENCE");
  for (const exp of tailored.experience) {
    lines.push(`${exp.company} — ${exp.title} | ${exp.dates}${exp.location ? " | " + exp.location : ""}`);
    for (const b of exp.bullets) {
      lines.push(`• ${b.rewritten}`);
    }
    lines.push("");
  }
  if (tailored.skills?.length > 0) {
    lines.push("SKILLS");
    lines.push(tailored.skills.join(", "));
  }
  return lines.join("\n");
}

export function ResultPageClient() {
  const router = useRouter();
  const [mode, setMode] = useState<IntakeMode>("role");
  const [tailored, setTailored] = useState<TailoredOutput | null>(null);
  const [companyTailored, setCompanyTailored] =
    useState<CompanyTailoredOutput | null>(null);
  const [targetPersons, setTargetPersons] =
    useState<TargetPersonsResponse | null>(null);
  const [session, setSession] = useState<SessionState | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (s.mode === "company") {
      if (!s.companyTailored) {
        router.replace("/start");
        return;
      }
      setMode("company");
      setCompanyTailored(s.companyTailored);
      setTargetPersons(s.targetPersons ?? null);
    } else {
      if (!s.tailored) {
        router.replace("/start");
        return;
      }
      setMode("role");
      setTailored(s.tailored);
    }
    setSession(s);
  }, [router]);

  function onStartOver() {
    clearSession();
    router.push("/start");
  }

  async function fetchTargetPersons() {
    if (!companyTailored) throw new Error("Company-mode output is not ready.");
    const s = loadSession();
    if (!s.companyContent || !s.companyFit) {
      throw new Error("Company analysis is not available.");
    }

    const res = await fetch("/api/demo/target-persons", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({
        resume: s.resume,
        companyContent: s.companyContent.text,
        companyName: s.companyFit.companyName,
        valuesObserved: s.companyFit.valuesObserved,
        positioning: companyTailored.coldOutreachAngle.positioning,
        draftMessage: companyTailored.coldOutreachAngle.draftMessage,
        companyHooksUsed: companyTailored.companyHooksUsed,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string };
      throw new Error(body.error ?? `Request failed (${res.status}).`);
    }
    const data = (await res.json()) as { archetypes: TargetPersonArchetype[] };
    const persisted: TargetPersonsResponse = { archetypes: data.archetypes };
    setTargetPersons(persisted);
    saveSession({ ...s, targetPersons: persisted, updatedAt: Date.now() });
  }

  if (!session) {
    return <p className="text-sm text-[#a8a29e]">Loading your result…</p>;
  }

  // Build intake answers array from session
  const intakeAnswers = (session.questions?.questions ?? []).map((q) => ({
    question: q.question,
    answer: session.answers[q.id] ?? "",
  }));

  if (mode === "company" && companyTailored) {
    return (
      <CompanyResultView
        tailored={companyTailored}
        targetPersons={targetPersons}
        onFetchTargetPersons={fetchTargetPersons}
        onStartOver={onStartOver}
        resume={session.resume}
        companyContent={session.companyContent?.text ?? ""}
        companyUrl={session.companyUrl}
        intakeAnswers={intakeAnswers}
      />
    );
  }
  if (mode === "role" && tailored) {
    return (
      <RoleResultView
        tailored={tailored}
        onStartOver={onStartOver}
        resume={session.resume}
        jd={session.jd}
        intakeAnswers={intakeAnswers}
      />
    );
  }
  return <p className="text-sm text-[#a8a29e]">Loading your result…</p>;
}

function RoleResultView({
  tailored,
  onStartOver,
  resume,
  jd,
  intakeAnswers,
}: {
  tailored: TailoredOutput;
  onStartOver: () => void;
  resume: string;
  jd: string;
  intakeAnswers: { question: string; answer: string }[];
}) {
  const resumeText = buildPlainTextResume(tailored);
  const contactLine = [
    tailored.contact.location,
    tailored.contact.phone,
    tailored.contact.email,
    tailored.contact.linkedin,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <div className="card-layer-1 flex flex-col gap-2">
        <p className="section-label">Step 4 — Result</p>
        <h1 className="text-2xl font-semibold tracking-tight text-[#e8e4de] sm:text-3xl">
          Your tailored resume + interview prep.
        </h1>
        <p className="text-base text-[#a8a29e]">
          Bullets are ATS-optimized and verified against your inputs. Nothing
          fabricated.
        </p>
      </div>

      <ResumeDiff originalText={resume} tailoredText={resumeText}>
        <div className="flex flex-col gap-4">
          <section className="card-surface flex flex-col gap-1">
            <p className="section-label mb-1">Contact</p>
            <p className="text-base font-semibold text-[#e8e4de]">
              {tailored.contact.name}
            </p>
            {contactLine && (
              <p className="text-sm text-[#a8a29e]">{contactLine}</p>
            )}
          </section>

          <section className="card-surface flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="section-label">Professional summary</p>
              <CopyButton text={tailored.summary} />
            </div>
            <p className="text-base leading-relaxed text-[#e8e4de]">
              {tailored.summary}
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <p className="section-label">Tailored experience</p>
            <TailoredExperience experience={tailored.experience} />
          </section>

          {tailored.skills?.length > 0 && (
            <section className="card-surface">
              <p className="section-label mb-2">Skills</p>
              <p className="text-sm leading-relaxed text-[#e8e4de]">
                {tailored.skills.join(" · ")}
              </p>
            </section>
          )}
        </div>
      </ResumeDiff>

      {tailored.keywordsIntegrated.length > 0 && (
        <section className="card-surface">
          <p className="section-label mb-2">JD keywords integrated</p>
          <div className="flex flex-wrap gap-2">
            {tailored.keywordsIntegrated.map((k, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-1 font-mono text-xs uppercase tracking-[0.06em] text-[#4ade80]"
              >
                {k}
              </span>
            ))}
          </div>
        </section>
      )}

      {tailored.keywordsMissed?.length > 0 && (
        <section className="card-surface" style={{ borderLeft: "3px solid #fbbf24" }}>
          <p className="section-label mb-2" style={{ color: "#fbbf24" }}>
            JD keywords NOT integrated (no supporting evidence)
          </p>
          <div className="flex flex-wrap gap-2">
            {tailored.keywordsMissed.map((k, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1 font-mono text-xs uppercase tracking-[0.06em] text-[#a8a29e]"
              >
                {k}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#a8a29e]">
            These were in the JD but your resume + intake answers didn&apos;t
            support them. Stuffing them anyway would trigger the
            claimed-vs-demonstrated mismatch check. Add evidence and rerun if
            this gap matters.
          </p>
        </section>
      )}

      <CoverLetterSection
        mode="role"
        resume={resume}
        jd={jd}
        intakeAnswers={intakeAnswers}
      />

      <section className="flex flex-col gap-3">
        <p className="section-label">Interview prep</p>
        <InterviewPrep prep={tailored.interviewPrep} />
      </section>

      <RecruiterScanSection resumeText={resumeText} />

      <InfoBlock tone="gold">
        <strong>LinkedIn consistency check.</strong> Before you submit through a
        Workday or iCIMS portal, verify your LinkedIn job titles and dates
        match the resume exactly. Both vendors cross-reference and a mismatch
        downgrades your score.
      </InfoBlock>

      <ApplicationPackage
        mode="role"
        tailored={tailored}
        jobTitle={jd.split("\n")[0]?.trim().slice(0, 80) || undefined}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <DownloadDocxButton tailored={tailored} />
        <Button variant="secondary" onClick={onStartOver} className="sm:w-auto">
          Start over with a new resume
        </Button>
      </div>
    </>
  );
}

function CompanyResultView({
  tailored,
  targetPersons,
  onFetchTargetPersons,
  onStartOver,
  resume,
  companyContent,
  companyUrl,
  intakeAnswers,
}: {
  tailored: CompanyTailoredOutput;
  targetPersons: TargetPersonsResponse | null;
  onFetchTargetPersons: () => Promise<void>;
  onStartOver: () => void;
  resume: string;
  companyContent: string;
  companyUrl: string;
  intakeAnswers: { question: string; answer: string }[];
}) {
  const resumeText = buildPlainTextResume(tailored);
  const contactLine = [
    tailored.contact.location,
    tailored.contact.phone,
    tailored.contact.email,
    tailored.contact.linkedin,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <div className="card-layer-1 flex flex-col gap-2">
        <p className="section-label">Step 4 — Result</p>
        <h1 className="text-2xl font-semibold tracking-tight text-[#e8e4de] sm:text-3xl">
          Your cold-outreach kit.
        </h1>
        <p className="text-base text-[#a8a29e]">
          A tailored resume, a positioning angle, and a draft message you can
          send. All grounded in their site and your inputs.
        </p>
      </div>

      <section className="card-surface" style={{ borderTop: "3px solid #4ade80" }}>
        <p className="section-label mb-2">Positioning angle</p>
        <p className="text-base leading-relaxed text-[#e8e4de]">
          {tailored.coldOutreachAngle.positioning}
        </p>
      </section>

      <section className="card-surface">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="section-label">Draft message</p>
          <CopyButton text={tailored.coldOutreachAngle.draftMessage} />
        </div>
        <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-[#e8e4de]">
          {tailored.coldOutreachAngle.draftMessage}
        </pre>
        <p className="mt-3 text-xs text-[#a8a29e]">
          Read it once before sending. Anything that doesn&apos;t sound like
          you, edit. You&apos;re signing it.
        </p>
      </section>

      {tailored.companyHooksUsed?.length > 0 && (
        <section className="card-surface">
          <p className="section-label mb-2">What the message references</p>
          <ul className="ml-5 list-disc text-sm leading-relaxed text-[#e8e4de]">
            {tailored.companyHooksUsed.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-[#a8a29e]">
            Every claim above is from their site. Nothing invented.
          </p>
        </section>
      )}

      <TargetPersonsPanel
        archetypes={targetPersons?.archetypes ?? null}
        onFetch={onFetchTargetPersons}
      />

      <ResumeDiff originalText={resume} tailoredText={resumeText}>
        <div className="flex flex-col gap-4">
          <section className="card-surface flex flex-col gap-1">
            <p className="section-label mb-1">Contact</p>
            <p className="text-base font-semibold text-[#e8e4de]">
              {tailored.contact.name}
            </p>
            {contactLine && (
              <p className="text-sm text-[#a8a29e]">{contactLine}</p>
            )}
          </section>

          <section className="card-surface flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="section-label">Professional summary</p>
              <CopyButton text={tailored.summary} />
            </div>
            <p className="text-base leading-relaxed text-[#e8e4de]">
              {tailored.summary}
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <p className="section-label">Tailored experience</p>
            <TailoredExperience experience={tailored.experience} />
          </section>

          {tailored.skills?.length > 0 && (
            <section className="card-surface">
              <p className="section-label mb-2">Skills</p>
              <p className="text-sm leading-relaxed text-[#e8e4de]">
                {tailored.skills.join(" · ")}
              </p>
            </section>
          )}
        </div>
      </ResumeDiff>

      <section className="flex flex-col gap-3">
        <p className="section-label">If they reply, prep for these</p>
        <InterviewPrep prep={tailored.interviewPrep} />
      </section>

      <CoverLetterSection
        mode="company"
        resume={resume}
        companyContent={companyContent}
        companyUrl={companyUrl}
        intakeAnswers={intakeAnswers}
      />

      <RecruiterScanSection resumeText={resumeText} />

      <ApplicationPackage mode="company" tailored={tailored} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <DownloadDocxButton tailored={tailored} />
        <Button variant="secondary" onClick={onStartOver} className="sm:w-auto">
          Start over
        </Button>
      </div>
    </>
  );
}

function DownloadDocxButton({
  tailored,
}: {
  tailored: TailoredOutput | CompanyTailoredOutput;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onClick() {
    setBusy(true);
    setErr(null);
    try {
      const { buildResumeDocx } = await import("@/lib/generate-docx");
      const { blob, fileName } = await buildResumeDocx({ tailored });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Download failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-1">
      <Button onClick={onClick} disabled={busy} fullWidth>
        {busy ? "Building .docx…" : "Download resume as .docx"}
      </Button>
      {err && (
        <p className="text-xs text-[#f87171]" role="alert">
          {err}
        </p>
      )}
    </div>
  );
}
