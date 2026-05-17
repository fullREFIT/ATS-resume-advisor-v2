"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/CopyButton";
import { InfoBlock } from "@/components/ui/InfoBlock";
import { InterviewPrep } from "@/components/InterviewPrep";
import { TailoredExperience } from "@/components/TailoredBullets";
import { clearSession, loadSession } from "@/lib/storage";
import type { SessionState, TailoredOutput } from "@/lib/types";

export function ResultPageClient() {
  const router = useRouter();
  const [tailored, setTailored] = useState<TailoredOutput | null>(null);
  const [session, setSession] = useState<SessionState | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s.tailored) {
      router.replace("/");
      return;
    }
    setTailored(s.tailored);
    setSession(s);
  }, [router]);

  if (!tailored || !session) {
    return <p className="text-sm text-echo">Loading your result…</p>;
  }

  function onStartOver() {
    clearSession();
    router.push("/");
  }

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
        <h1 className="text-2xl font-semibold tracking-tight text-carbon-core sm:text-3xl">
          Your tailored resume + interview prep.
        </h1>
        <p className="text-base text-carbon-core">
          Bullets are ATS-optimized and verified against your inputs. Nothing
          fabricated.
        </p>
      </div>

      <section className="card-surface flex flex-col gap-1">
        <p className="section-label mb-1">Contact</p>
        <p className="text-base font-semibold text-carbon-core">
          {tailored.contact.name}
        </p>
        {contactLine && (
          <p className="text-sm text-echo">{contactLine}</p>
        )}
      </section>

      <section className="card-surface flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="section-label">Professional summary</p>
          <CopyButton text={tailored.summary} />
        </div>
        <p className="text-base leading-relaxed text-carbon-core">
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
          <p className="text-sm leading-relaxed text-carbon-core">
            {tailored.skills.join(" · ")}
          </p>
        </section>
      )}

      {tailored.keywordsIntegrated.length > 0 && (
        <section className="card-surface">
          <p className="section-label mb-2">JD keywords integrated</p>
          <div className="flex flex-wrap gap-2">
            {tailored.keywordsIntegrated.map((k, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full border border-soft-gray bg-ash-white px-3 py-1 font-mono text-xs uppercase tracking-[0.06em] text-carbon-core"
              >
                {k}
              </span>
            ))}
          </div>
        </section>
      )}

      {tailored.keywordsMissed?.length > 0 && (
        <section className="card-surface border-l-[3px] border-l-forge-gold">
          <p className="section-label mb-2 text-forge-dark">
            JD keywords NOT integrated (no supporting evidence)
          </p>
          <div className="flex flex-wrap gap-2">
            {tailored.keywordsMissed.map((k, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full border border-soft-gray bg-pure-white px-3 py-1 font-mono text-xs uppercase tracking-[0.06em] text-echo"
              >
                {k}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-echo">
            These were in the JD but your resume + intake answers didn&apos;t
            support them. Stuffing them anyway would trigger the
            claimed-vs-demonstrated mismatch check. Add evidence and rerun if
            this gap matters.
          </p>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <p className="section-label">Interview prep</p>
        <InterviewPrep prep={tailored.interviewPrep} />
      </section>

      <InfoBlock tone="gold">
        <strong>LinkedIn consistency check.</strong> Before you submit through a
        Workday or iCIMS portal, verify your LinkedIn job titles and dates
        match the resume exactly. Both vendors cross-reference and a mismatch
        downgrades your score.
      </InfoBlock>

      <div className="flex flex-col gap-3 sm:flex-row">
        <DownloadDocxButton tailored={tailored} />
        <Button
          variant="secondary"
          onClick={onStartOver}
          className="sm:w-auto"
        >
          Start over with a new resume
        </Button>
      </div>
    </>
  );
}

function DownloadDocxButton({ tailored }: { tailored: TailoredOutput }) {
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
        {busy ? "Building .docx…" : "Download as .docx"}
      </Button>
      {err && (
        <p className="text-xs text-forge-red" role="alert">
          {err}
        </p>
      )}
    </div>
  );
}
