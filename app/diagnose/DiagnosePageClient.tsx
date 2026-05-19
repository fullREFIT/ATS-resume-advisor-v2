"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DiagnosisCard } from "@/components/DiagnosisCard";
import { CompanyFitCard } from "@/components/CompanyFitCard";
import { GapCloser } from "@/components/GapCloser";
import { ScoreReport } from "@/components/ScoreReport";
import { Button } from "@/components/ui/Button";
import { callApi } from "@/lib/api-fetch";
import { clearSession, loadSession, patchSession, pushHistory } from "@/lib/storage";
import type {
  CompanyFit,
  Diagnosis,
  IntakeMode,
  QuestionsResponse,
} from "@/lib/types";

function extractJobTitle(jd: string): string {
  const firstLine = jd.split("\n")[0]?.trim() ?? "";
  if (firstLine.length > 0 && firstLine.length <= 80) return firstLine;
  return jd.slice(0, 60).replace(/\n/g, " ").trim() || "Unknown";
}

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
      // Record history entry for company mode
      pushHistory({
        mode: "company",
        companyName: s.companyFit.companyName,
      });
    } else {
      if (!s.diagnosis || !s.resume || !s.jd) {
        router.replace("/start");
        return;
      }
      setMode("role");
      setDiagnosis(s.diagnosis);
      setResume(s.resume);
      setJd(s.jd);
      // Record history entry for role mode
      pushHistory({
        mode: "role",
        verdict: s.diagnosis.verdict,
        matchScore: s.diagnosis.matchScore,
        scoreBreakdown: {
          keywordMatch: s.diagnosis.scoreBreakdown.keywordMatch.score,
          experienceRelevance: s.diagnosis.scoreBreakdown.experienceRelevance.score,
          trajectoryFit: s.diagnosis.scoreBreakdown.trajectoryFit.score,
          atsParsing: s.diagnosis.scoreBreakdown.atsParsing.score,
        },
        jobTitle: extractJobTitle(s.jd),
        companyName: undefined,
      });
    }
  }, [router]);

  const isLoaded = mode === "role" ? !!diagnosis : !!companyFit;
  if (!isLoaded) {
    return <p className="text-sm text-[#a8a29e]">Loading your analysis…</p>;
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
        <h1 className="text-2xl font-semibold tracking-tight text-[#e8e4de] sm:text-3xl">
          {mode === "company"
            ? "Here's the honest read on this company."
            : "Here's the honest read."}
        </h1>
        <p className="text-base text-[#a8a29e]">
          {mode === "company"
            ? "Grounded in what's actually on their site. Anything not on the site is not asserted."
            : "Parsing failure is the #1 cause of low ATS rankings — flagged first when present."}
        </p>
      </div>

      {mode === "role" && diagnosis && <DiagnosisCard diagnosis={diagnosis} />}
      {mode === "role" && diagnosis && <ScoreReport diagnosis={diagnosis} />}
      {mode === "role" && diagnosis && (
        <GapCloser
          verdict={diagnosis.verdict}
          resume={resume}
          jd={jd}
          diagnosis={diagnosis}
        />
      )}
      {mode === "company" && companyFit && (
        <CompanyFitCard fit={companyFit} />
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-[#f87171]/30 bg-[#7f1d1d]/20 p-3 text-sm text-[#f87171]"
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
        <div className="card-surface border-l-[3px] border-l-[#a8a29e]">
          <p className="section-label mb-2">Why we won&apos;t tailor this</p>
          <p className="text-sm leading-relaxed text-[#e8e4de]">
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
