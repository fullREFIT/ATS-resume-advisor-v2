"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DiagnosisCard } from "@/components/DiagnosisCard";
import { Button } from "@/components/ui/Button";
import { callApi } from "@/lib/api-fetch";
import { clearSession, loadSession, patchSession } from "@/lib/storage";
import type { Diagnosis, QuestionsResponse } from "@/lib/types";

export function DiagnosePageClient() {
  const router = useRouter();
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s.diagnosis || !s.resume || !s.jd) {
      router.replace("/");
      return;
    }
    setDiagnosis(s.diagnosis);
    setResume(s.resume);
    setJd(s.jd);
  }, [router]);

  if (!diagnosis) {
    return (
      <p className="text-sm text-echo">Loading your diagnosis…</p>
    );
  }

  const canContinue =
    diagnosis.verdict === "GO" || diagnosis.verdict === "FIX_FIRST";

  async function onRefine() {
    if (!diagnosis) return;
    setLoadingQuestions(true);
    setError(null);
    try {
      const data = await callApi<
        { resume: string; jd: string; diagnosis: Diagnosis },
        { questions?: QuestionsResponse }
      >({
        endpoint: "questions",
        body: { resume, jd, diagnosis },
      });
      if (!data.questions) {
        throw new Error("Failed to generate questions.");
      }
      patchSession({ questions: data.questions, answers: {} });
      router.push("/refine");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
    } finally {
      setLoadingQuestions(false);
    }
  }

  function onStartOver() {
    clearSession();
    router.push("/");
  }

  return (
    <>
      <div className="card-layer-1 flex flex-col gap-2">
        <p className="section-label">Step 2 — Diagnosis</p>
        <h1 className="text-2xl font-semibold tracking-tight text-carbon-core sm:text-3xl">
          Here&apos;s the honest read.
        </h1>
        <p className="text-base text-carbon-core">
          Parsing failure is the #1 cause of low ATS rankings — flagged first
          when present.
        </p>
      </div>

      <DiagnosisCard diagnosis={diagnosis} />

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-forge-red/30 bg-forge-red/10 p-3 text-sm text-forge-red"
        >
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        {canContinue && (
          <Button
            onClick={onRefine}
            disabled={loadingQuestions}
            fullWidth
          >
            {loadingQuestions ? "Building intake…" : "Refine my resume"}
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={onStartOver}
          fullWidth={!canContinue}
          className={canContinue ? "sm:w-auto" : ""}
        >
          Start over
        </Button>
      </div>

      {!canContinue && (
        <div className="card-surface border-l-[3px] border-l-echo">
          <p className="section-label mb-2">Why we won&apos;t tailor this</p>
          <p className="text-sm leading-relaxed text-carbon-core">
            The gap is too wide. Tailoring keywords can&apos;t close a missing
            requirement, and stuffing keywords without evidence raises a
            fabrication flag at the recruiter layer. Build the evidence first
            (project, cert, adjacent role), then come back.
          </p>
        </div>
      )}
    </>
  );
}
