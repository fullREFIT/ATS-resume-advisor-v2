"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DiagnosisCard } from "@/components/DiagnosisCard";
import { CompanyFitCard } from "@/components/CompanyFitCard";
import { Button } from "@/components/ui/Button";
import { callApi } from "@/lib/api-fetch";
import { clearSession, loadSession, patchSession } from "@/lib/storage";
import type {
  CompanyFit,
  Diagnosis,
  IntakeMode,
  QuestionsResponse,
} from "@/lib/types";

export function DiagnosePageClient() {
  const router = useRouter();
  const [mode, setMode] = useState<IntakeMode>("role");
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [companyFit, setCompanyFit] = useState<CompanyFit | null>(null);
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [companyContent, setCompanyContent] = useState("");
  const [desiredRole, setDesiredRole] = useState("");
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (s.mode === "company") {
      if (!s.companyFit || !s.resume || !s.companyContent) {
        router.replace("/start");
        return;
      }
      setMode("company");
      setCompanyFit(s.companyFit);
      setResume(s.resume);
      setCompanyContent(s.companyContent.text);
      setDesiredRole(s.desiredRole);
    } else {
      if (!s.diagnosis || !s.resume || !s.jd) {
        router.replace("/start");
        return;
      }
      setMode("role");
      setDiagnosis(s.diagnosis);
      setResume(s.resume);
      setJd(s.jd);
    }
  }, [router]);

  const isLoaded = mode === "role" ? !!diagnosis : !!companyFit;
  if (!isLoaded) {
    return <p className="text-sm text-echo">Loading your analysis…</p>;
  }

  const canContinue =
    mode === "company"
      ? true
      : !!diagnosis &&
        (diagnosis.verdict === "GO" || diagnosis.verdict === "FIX_FIRST");

  async function onRefine() {
    setLoadingQuestions(true);
    setError(null);
    try {
      if (mode === "role" && diagnosis) {
        const data = await callApi<
          { resume: string; jd: string; diagnosis: Diagnosis },
          { questions?: QuestionsResponse }
        >({
          endpoint: "questions",
          body: { resume, jd, diagnosis },
        });
        if (!data.questions) throw new Error("Failed to generate questions.");
        patchSession({ questions: data.questions, answers: {} });
        router.push("/refine");
      } else if (mode === "company" && companyFit) {
        const data = await callApi<
          {
            resume: string;
            companyContent: string;
            companyFit: CompanyFit;
            desiredRole?: string;
          },
          { questions?: QuestionsResponse }
        >({
          endpoint: "company-questions",
          body: {
            resume,
            companyContent,
            companyFit,
            desiredRole: desiredRole || undefined,
          },
        });
        if (!data.questions) throw new Error("Failed to generate questions.");
        patchSession({ questions: data.questions, answers: {} });
        router.push("/refine");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
    } finally {
      setLoadingQuestions(false);
    }
  }

  function onStartOver() {
    clearSession();
    router.push("/start");
  }

  return (
    <>
      <div className="card-layer-1 flex flex-col gap-2">
        <p className="section-label">Step 2 — Diagnosis</p>
        <h1 className="text-2xl font-semibold tracking-tight text-carbon-core sm:text-3xl">
          {mode === "company"
            ? "Here's the honest read on this company."
            : "Here's the honest read."}
        </h1>
        <p className="text-base text-carbon-core">
          {mode === "company"
            ? "Grounded in what's actually on their site. Anything not on the site is not asserted."
            : "Parsing failure is the #1 cause of low ATS rankings — flagged first when present."}
        </p>
      </div>

      {mode === "role" && diagnosis && <DiagnosisCard diagnosis={diagnosis} />}
      {mode === "company" && companyFit && (
        <CompanyFitCard fit={companyFit} />
      )}

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
          <Button onClick={onRefine} disabled={loadingQuestions} fullWidth>
            {loadingQuestions
              ? "Building intake…"
              : mode === "company"
                ? "Build the cold-outreach intake"
                : "Refine my resume"}
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

      {mode === "role" && !canContinue && (
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
