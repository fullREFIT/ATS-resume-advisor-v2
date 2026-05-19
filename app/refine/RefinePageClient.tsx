"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { InfoBlock } from "@/components/ui/InfoBlock";
import { callApi } from "@/lib/api-fetch";
import { loadSession, patchSession } from "@/lib/storage";
import type {
  CompanyTailoredOutput,
  IntakeMode,
  Question,
  QuestionsResponse,
  TailoredOutput,
} from "@/lib/types";

const MIN_ANSWER_LEN = 20;

export function RefinePageClient() {
  const router = useRouter();
  const [mode, setMode] = useState<IntakeMode>("role");
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [companyContent, setCompanyContent] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [desiredRole, setDesiredRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s.questions || !s.resume) {
      router.replace("/start");
      return;
    }
    if (s.mode === "company") {
      if (!s.companyContent) {
        router.replace("/start");
        return;
      }
      setMode("company");
      setCompanyContent(s.companyContent.text);
      setCompanyUrl(s.companyContent.url);
      setDesiredRole(s.desiredRole);
    } else {
      if (!s.jd) {
        router.replace("/start");
        return;
      }
      setMode("role");
      setJd(s.jd);
    }
    setQuestions((s.questions as QuestionsResponse).questions);
    setAnswers(s.answers ?? {});
    setResume(s.resume);
  }, [router]);

  if (!questions) {
    return <p className="text-sm text-[#a8a29e]">Loading your intake…</p>;
  }

  const allAnswered = questions.every(
    (q) => (answers[q.id] ?? "").trim().length >= MIN_ANSWER_LEN,
  );

  function updateAnswer(id: string, value: string) {
    const next = { ...answers, [id]: value };
    setAnswers(next);
    patchSession({ answers: next });
  }

  async function onGenerate() {
    if (!allAnswered) return;
    setLoading(true);
    setError(null);
    try {
      const intakeAnswers = questions!.map((q) => ({
        question: q.question,
        answer: answers[q.id] ?? "",
      }));
      if (mode === "company") {
        const data = await callApi<
          {
            resume: string;
            companyContent: string;
            companyUrl: string;
            desiredRole?: string;
            intakeAnswers: { question: string; answer: string }[];
          },
          { output?: CompanyTailoredOutput }
        >({
          endpoint: "company-output",
          body: {
            resume,
            companyContent,
            companyUrl,
            desiredRole: desiredRole || undefined,
            intakeAnswers,
          },
        });
        if (!data.output) throw new Error("Failed to generate output.");
        patchSession({ companyTailored: data.output });
        router.push("/result");
      } else {
        const data = await callApi<
          {
            resume: string;
            jd: string;
            intakeAnswers: { question: string; answer: string }[];
          },
          { output?: TailoredOutput }
        >({
          endpoint: "output",
          body: { resume, jd, intakeAnswers },
        });
        if (!data.output) throw new Error("Failed to generate output.");
        patchSession({ tailored: data.output });
        router.push("/result");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="card-layer-1 flex flex-col gap-2">
        <p className="section-label">Step 3 — Refine</p>
        <h1 className="text-2xl font-semibold tracking-tight text-[#e8e4de] sm:text-3xl">
          Five questions to surface real evidence.
        </h1>
        <p className="text-base text-[#a8a29e]">
          Specific answers — outcomes, numbers, tools — produce stronger
          {mode === "company" ? " positioning" : " bullets"}. Vague answers
          produce vague output.
        </p>
      </div>

      <InfoBlock>
        {mode === "company"
          ? "The AI will use ONLY what you tell it here plus what's in your resume. Claims about the company are checked against the site content. Nothing fabricated."
          : "The AI will use ONLY what you tell it here plus what's already in your resume. Nothing else gets fabricated."}
      </InfoBlock>

      <ol className="flex flex-col gap-4">
        {questions.map((q, i) => {
          const value = answers[q.id] ?? "";
          const tooShort = value.length > 0 && value.length < MIN_ANSWER_LEN;
          return (
            <li key={q.id} className="card-surface flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e8e4de] font-mono text-xs font-bold text-[#0a0a0a]">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-base font-semibold leading-snug text-[#e8e4de]">
                    {q.question}
                  </p>
                  <p className="mt-1 text-xs text-[#a8a29e]">
                    <span className="font-mono uppercase tracking-[0.08em] text-[#4ade80]">
                      Category:
                    </span>{" "}
                    {q.category} · {q.why}
                  </p>
                </div>
              </div>
              <textarea
                value={value}
                onChange={(e) => updateAnswer(q.id, e.target.value)}
                placeholder="Be specific. Numbers, tools, outcomes."
                className="min-h-[120px] w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] p-3 text-base text-[#e8e4de] placeholder:text-[#78716c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80]"
              />
              {tooShort && (
                <p className="text-xs text-[#a8a29e]">
                  Add more — at least {MIN_ANSWER_LEN} characters.
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-[#f87171]/30 bg-[#7f1d1d]/20 p-3 text-sm text-[#f87171]"
        >
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={onGenerate}
          disabled={!allAnswered || loading}
          fullWidth
        >
          {loading
            ? "Tailoring + fact-checking… (about 30 seconds)"
            : mode === "company"
              ? "Generate tailored resume + outreach"
              : "Generate tailored resume"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => router.push("/diagnose")}
          className="sm:w-auto"
        >
          Back
        </Button>
      </div>
    </>
  );
}
