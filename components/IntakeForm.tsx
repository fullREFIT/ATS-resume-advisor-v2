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

export function IntakeForm() {
  const router = useRouter();
  const [mode, setMode] = useState<IntakeMode>("role");
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
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
    setHydrated(true);
  }, []);

  // Persist mode immediately so refresh keeps the user's choice.
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
        // Company mode: fetch URL, then diagnose against the fetched content.
        const fetched = await callApi<
          { url: string },
          { company?: FetchedCompanyContent }
        >({
          endpoint: "fetch-company",
          body: { url: companyUrl.trim() },
        });
        if (!fetched.company) throw new Error("Couldn't read that website.");
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
            companyContent: fetched.company.text,
            companyUrl: fetched.company.url,
            desiredRole: desiredRole.trim() || undefined,
          },
        });
        if (!data.fit) throw new Error("Company-fit analysis failed.");
        patchSession({
          mode,
          resume,
          companyUrl: companyUrl.trim(),
          desiredRole: desiredRole.trim(),
          companyContent: fetched.company,
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
          className="min-h-[200px] w-full rounded-lg border border-soft-gray bg-pure-white p-4 text-base text-carbon-core focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-red"
        />
        {hydrated && resume.trim().length > 0 && resume.trim().length < 50 && (
          <p className="text-xs text-echo">
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
            className="min-h-[180px] w-full rounded-lg border border-soft-gray bg-pure-white p-4 text-base text-carbon-core focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-red"
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
              className="min-h-12 w-full rounded-lg border border-soft-gray bg-pure-white px-3 text-base text-carbon-core focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-red"
            />
            {hydrated &&
              companyUrl.trim().length > 0 &&
              LINKEDIN_RE.test(companyUrl) && (
                <p className="text-xs text-forge-red">
                  LinkedIn blocks automated reads. Use the company&apos;s own
                  website instead (e.g., their About page).
                </p>
              )}
            {hydrated &&
              companyUrl.trim().length > 0 &&
              !isLikelyUrl(companyUrl) && (
                <p className="text-xs text-echo">
                  Include https:// or http:// at the start.
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
              className="min-h-12 w-full rounded-lg border border-soft-gray bg-pure-white px-3 text-base text-carbon-core focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-red"
            />
            <p className="text-xs text-echo">
              Helps anchor the tailoring. Leave blank and the tool will infer
              from your background.
            </p>
          </div>
        </>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-forge-red/30 bg-forge-red/10 p-3 text-sm text-forge-red"
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
