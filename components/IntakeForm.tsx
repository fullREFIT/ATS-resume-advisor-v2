"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ATSContextBlock } from "@/components/ATSContextBlock";
import { LocalStorageDisclaimer } from "@/components/LocalStorageDisclaimer";
import { ResumeUpload } from "@/components/ResumeUpload";
import { ModeToggle } from "@/components/ModeToggle";
import { callApi } from "@/lib/api-fetch";
import { loadSession, patchSession } from "@/lib/storage";
import type {
  CompanyFit,
  Diagnosis,
  FetchedCompanyContent,
  IntakeMode,
} from "@/lib/types";

const LINKEDIN_RE = /linkedin\.com\//i;

function isLikelyUrl(s: string): boolean {
  return /^https?:\/\/[^\s]+\.[^\s]+/.test(s.trim());
}

const INPUT_CLASS =
  "w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-4 text-base text-[#e8e4de] placeholder:text-[#78716c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80]";

export function IntakeForm() {
  const router = useRouter();
  const [mode, setMode] = useState<IntakeMode>("role");
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [companyText, setCompanyText] = useState("");
  const [desiredRole, setDesiredRole] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const s = loadSession();
    setMode(s.mode);
    setResume(s.resume);
    setJd(s.jd);
    setCompanyUrl(s.companyUrl);
    setDesiredRole(s.desiredRole);
    setCompanyText("");
    setHydrated(true);
  }, []);

  function onChangeMode(next: IntakeMode) {
    setMode(next);
    patchSession({ mode: next });
  }

  const resumeOk = resume.trim().length >= 50;
  const roleReady = resumeOk && jd.trim().length >= 50;
  const companyReady =
    resumeOk && isLikelyUrl(companyUrl) && !LINKEDIN_RE.test(companyUrl);
  const canSubmit = (mode === "role" ? roleReady : companyReady) && !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      if (mode === "role") {
        const data = await callApi<
          { resume: string; jd: string },
          { diagnosis?: Diagnosis }
        >({
          endpoint: "diagnose",
          body: { resume, jd },
        });
        if (!data.diagnosis) throw new Error("Diagnosis failed.");
        patchSession({
          mode,
          resume,
          jd,
          diagnosis: data.diagnosis,
          companyFit: undefined,
          companyContent: undefined,
          companyTailored: undefined,
          answers: {},
          questions: undefined,
          tailored: undefined,
        });
        router.push("/diagnose");
      } else {
        const pastedContent = companyText.trim();
        const usePaste = pastedContent.length >= 200;

        let resolvedContent: FetchedCompanyContent;
        if (usePaste) {
          resolvedContent = {
            url: companyUrl.trim(),
            text: pastedContent,
            charCount: pastedContent.length,
            fetchedAt: Date.now(),
          };
        } else {
          const fetched = await callApi<
            { url: string },
            { company?: FetchedCompanyContent }
          >({
            endpoint: "fetch-company",
            body: { url: companyUrl.trim() },
          });
          if (!fetched.company) throw new Error("Couldn't read that website.");
          resolvedContent = fetched.company;
        }

        const data = await callApi<
          {
            resume: string;
            companyContent: string;
            companyUrl: string;
            desiredRole?: string;
          },
          { fit?: CompanyFit }
        >({
          endpoint: "company-diagnose",
          body: {
            resume,
            companyContent: resolvedContent.text,
            companyUrl: resolvedContent.url,
            desiredRole: desiredRole.trim() || undefined,
          },
        });
        if (!data.fit) throw new Error("Company-fit analysis failed.");
        patchSession({
          mode,
          resume,
          companyUrl: companyUrl.trim(),
          desiredRole: desiredRole.trim(),
          companyContent: resolvedContent,
          companyFit: data.fit,
          diagnosis: undefined,
          tailored: undefined,
          companyTailored: undefined,
          answers: {},
          questions: undefined,
        });
        router.push("/diagnose");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit}>
      <ATSContextBlock />
      <LocalStorageDisclaimer />

      <ModeToggle value={mode} onChange={onChangeMode} />

      <div className="flex flex-col gap-2">
        <label htmlFor="resume" className="section-label">
          Your resume (paste plain text or upload)
        </label>
        <ResumeUpload onParsed={setResume} />
        <textarea
          id="resume"
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          placeholder="Paste your current resume here. Plain text works best."
          className={`min-h-[200px] ${INPUT_CLASS}`}
        />
        {hydrated && resume.trim().length > 0 && resume.trim().length < 50 && (
          <p className="text-xs text-[#a8a29e]">
            Add more — at least 50 characters of resume content.
          </p>
        )}
      </div>

      {mode === "role" ? (
        <div className="flex flex-col gap-2">
          <label htmlFor="jd" className="section-label">
            Target job description
          </label>
          <textarea
            id="jd"
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the full job description for the role you're targeting."
            className={`min-h-[180px] ${INPUT_CLASS}`}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <label htmlFor="company-url" className="section-label">
              Company website URL
            </label>
            <input
              id="company-url"
              type="url"
              value={companyUrl}
              onChange={(e) => setCompanyUrl(e.target.value)}
              placeholder="https://www.example.com"
              autoComplete="off"
              className={`min-h-12 px-3 ${INPUT_CLASS.replace("p-4", "")}`}
            />
            {hydrated &&
              companyUrl.trim().length > 0 &&
              LINKEDIN_RE.test(companyUrl) && (
                <p className="text-xs text-[#f87171]">
                  LinkedIn blocks automated reads. Use the company&apos;s own
                  website instead (e.g., their About page).
                </p>
              )}
            {hydrated &&
              companyUrl.trim().length > 0 &&
              !isLikelyUrl(companyUrl) && (
                <p className="text-xs text-[#a8a29e]">
                  Include https:// or http:// at the start.
                </p>
              )}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="company-text" className="section-label">
              Or paste company content directly (optional)
            </label>
            <textarea
              id="company-text"
              value={companyText}
              onChange={(e) => setCompanyText(e.target.value)}
              placeholder="Paste their About page, homepage text, or any description. If provided, this is used instead of fetching the URL — helpful when the site is hard to scrape."
              className={`min-h-[120px] ${INPUT_CLASS}`}
            />
            {companyText.trim().length > 0 && companyText.trim().length < 200 && (
              <p className="text-xs text-[#a8a29e]">
                Add more — at least 200 characters needed to use pasted content.
              </p>
            )}
            {companyText.trim().length >= 200 && (
              <p className="text-xs text-[#4ade80]">
                Pasted content will be used directly — URL fetch skipped.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="desired-role" className="section-label">
              What role would you ideally want there? (optional)
            </label>
            <input
              id="desired-role"
              type="text"
              value={desiredRole}
              onChange={(e) => setDesiredRole(e.target.value)}
              placeholder="e.g. Director of Sales, VP Operations, Head of Customer Success"
              autoComplete="off"
              className={`min-h-12 px-3 ${INPUT_CLASS.replace("p-4", "")}`}
            />
            <p className="text-xs text-[#a8a29e]">
              Helps anchor the tailoring. Leave blank and the tool will infer
              from your background.
            </p>
          </div>
        </>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-[#f87171]/30 bg-[#7f1d1d]/20 p-3 text-sm text-[#f87171]"
        >
          {error}
        </p>
      )}

      <Button type="submit" disabled={!canSubmit} fullWidth>
        {loading
          ? mode === "role"
            ? "Diagnosing…"
            : "Reading the company…"
          : mode === "role"
            ? "Diagnose fit"
            : "Analyze company fit"}
      </Button>
    </form>
  );
}
