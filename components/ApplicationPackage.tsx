"use client";

import { useEffect, useState } from "react";
import { loadSession } from "@/lib/storage";
import type {
  CompanyTailoredOutput,
  CoverLetterOutput,
  Diagnosis,
  RecruiterScan,
  TailoredOutput,
} from "@/lib/types";

interface ApplicationPackageProps {
  mode: "role" | "company";
  tailored: TailoredOutput | CompanyTailoredOutput;
  jobTitle?: string;
  company?: string;
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function ApplicationPackage({
  mode,
  tailored,
  jobTitle,
  company,
}: ApplicationPackageProps) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCoverLetter, setHasCoverLetter] = useState(false);
  const [hasRecruiterScan, setHasRecruiterScan] = useState(false);
  const [sessionCompany, setSessionCompany] = useState<string | undefined>(
    company,
  );

  useEffect(() => {
    function refresh() {
      const s = loadSession();
      setHasCoverLetter(!!s.coverLetter);
      setHasRecruiterScan(!!s.recruiterScan);
      if (!company && s.companyFit?.companyName) {
        setSessionCompany(s.companyFit.companyName);
      }
    }
    refresh();
    const interval = window.setInterval(refresh, 1500);
    return () => window.clearInterval(interval);
  }, [company]);

  async function buildAndDownload() {
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      const session = loadSession();
      const coverLetter: CoverLetterOutput | undefined = session.coverLetter;
      const recruiterScan: RecruiterScan | undefined = session.recruiterScan;
      const diagnosis: Diagnosis | undefined = session.diagnosis;

      const [
        { buildResumeDocx, buildCoverLetterDocx },
        { generateInterviewPrepMarkdown },
        { generateCheatSheet },
        JSZipMod,
      ] = await Promise.all([
        import("@/lib/generate-docx"),
        import("@/lib/generate-interview-prep"),
        import("@/lib/generate-cheat-sheet"),
        import("jszip"),
      ]);
      const JSZip = JSZipMod.default;

      const { blob: resumeBlob, fileName: resumeFileName } =
        await buildResumeDocx({ tailored });

      const interviewMd = generateInterviewPrepMarkdown(tailored.interviewPrep);

      const cheatSheet = generateCheatSheet({
        mode,
        tailored,
        diagnosis,
        recruiterScan,
        jobTitle,
        company: sessionCompany ?? company,
      });

      const zip = new JSZip();
      zip.file(resumeFileName, resumeBlob);
      if (coverLetter?.coverLetter) {
        const { blob: clBlob, fileName: clFileName } =
          await buildCoverLetterDocx(coverLetter.coverLetter);
        zip.file(clFileName, clBlob);
      }
      zip.file("interview-prep.md", interviewMd);
      zip.file("cheat-sheet.txt", cheatSheet);

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-verdict-package-${formatDate(new Date())}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setDone(true);
      window.setTimeout(() => setDone(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Package build failed.");
    } finally {
      setBusy(false);
    }
  }

  const includes: string[] = ["Tailored Resume (.docx)"];
  if (hasCoverLetter) includes.push("Cover Letter (.docx)");
  includes.push("Interview Prep (.md)");
  includes.push("Cheat Sheet (.txt)");

  return (
    <section className="flex flex-col gap-3">
      <div
        aria-hidden
        className="flex items-center gap-3"
        style={{ marginTop: 8 }}
      >
        <span
          style={{
            display: "inline-block",
            height: 1,
            flex: 1,
            background: "#2a2a2a",
          }}
        />
        <span
          style={{
            fontFamily: "var(--ls-mono), ui-monospace, monospace",
            fontSize: 11,
            letterSpacing: "0.18em",
            color: "#78716c",
          }}
        >
          EXPORT
        </span>
        <span
          style={{
            display: "inline-block",
            height: 1,
            flex: 1,
            background: "#2a2a2a",
          }}
        />
      </div>

      <div className="card-surface flex flex-col gap-3">
        <p className="section-label">Application package</p>
        <p className="text-sm leading-relaxed text-[#a8a29e]">
          You&apos;ve reviewed everything. Now take it all with you in one ZIP.
        </p>

        <button
          type="button"
          onClick={buildAndDownload}
          disabled={busy}
          style={{
            minHeight: 48,
            padding: "0 24px",
            borderRadius: 8,
            background: busy ? "#0f0f0f" : done ? "#14532d" : "#1a1a1a",
            color: done ? "#4ade80" : "#e8e4de",
            border: done ? "1px solid #4ade80" : "1px solid #2a2a2a",
            fontFamily: "var(--ls-sans), sans-serif",
            fontSize: 16,
            fontWeight: 700,
            cursor: busy ? "wait" : "pointer",
            transition: "all 0.15s",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
          onMouseEnter={(e) => {
            if (!busy && !done) e.currentTarget.style.background = "#2a2a2a";
          }}
          onMouseLeave={(e) => {
            if (!busy && !done) e.currentTarget.style.background = "#1a1a1a";
          }}
        >
          <svg
            aria-hidden
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {busy
            ? "Building your application package…"
            : done
              ? "Package downloaded!"
              : "Download Application Package"}
        </button>

        <p
          style={{
            fontFamily: "var(--ls-mono), ui-monospace, monospace",
            fontSize: 12,
            color: "#78716c",
          }}
        >
          Includes: {includes.join(" · ")}
        </p>

        {!hasCoverLetter && (
          <p className="text-xs text-[#78716c]">
            Generate a cover letter above to include it in the package.
          </p>
        )}
        {!hasRecruiterScan && (
          <p className="text-xs text-[#78716c]">
            Run the recruiter scan above to add its summary to the cheat sheet.
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-[#f87171]/30 bg-[#7f1d1d]/20 p-3 text-sm text-[#f87171]"
          >
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
