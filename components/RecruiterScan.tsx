"use client";

import { useEffect, useState } from "react";
import { loadSession, patchSession } from "@/lib/storage";
import type { RecruiterScan } from "@/lib/types";
import { authHeaders } from "@/lib/api-fetch";

type ScanVerdict = "ADVANCE" | "REJECT" | "MAYBE";

const VERDICT_STYLE: Record<ScanVerdict, { background: string; color: string; label: string }> = {
  ADVANCE: { background: "#14532d", color: "#4ade80", label: "ADVANCE" },
  REJECT: { background: "#7f1d1d", color: "#f87171", label: "REJECT" },
  MAYBE: { background: "#713f12", color: "#fbbf24", label: "MAYBE" },
};

function ScanVerdictBadge({ verdict }: { verdict: ScanVerdict }) {
  const s = VERDICT_STYLE[verdict];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 12px",
        borderRadius: 6,
        fontWeight: 700,
        fontSize: 12,
        letterSpacing: "0.1em",
        fontFamily: "var(--ls-mono, ui-monospace, monospace)",
        background: s.background,
        color: s.color,
      }}
    >
      {s.label}
    </span>
  );
}

export function RecruiterScanSection({ resumeText }: { resumeText: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [scan, setScan] = useState<RecruiterScan | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (s.recruiterScan && !scan) {
      setScan(s.recruiterScan);
      setStatus("done");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runScan() {
    setStatus("loading");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/demo/recruiter-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ resumeText }),
      });
      const data = (await res.json()) as { scan?: RecruiterScan; error?: string };
      if (!res.ok || !data.scan) {
        throw new Error(data.error ?? `Request failed (${res.status}).`);
      }
      setScan(data.scan);
      patchSession({ recruiterScan: data.scan });
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "An error occurred.");
      setStatus("error");
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <p className="section-label">6-Second Recruiter Scan</p>

      {status === "idle" && (
        <button
          onClick={runScan}
          style={{ minHeight: 44 }}
          className="inline-flex items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-5 py-3 text-sm font-semibold text-[#e8e4de] transition hover:bg-[#2a2a2a]"
        >
          Run 6-Second Recruiter Scan
        </button>
      )}

      {status === "loading" && (
        <p className="text-sm text-[#a8a29e]">Simulating recruiter scan...</p>
      )}

      {status === "error" && (
        <div className="flex flex-col gap-2">
          <p className="rounded-lg border border-[#f87171]/30 bg-[#7f1d1d]/20 p-3 text-sm text-[#f87171]">
            {errorMsg}
          </p>
          <button
            onClick={runScan}
            style={{ minHeight: 44 }}
            className="inline-flex w-fit items-center rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-5 py-3 text-sm font-semibold text-[#e8e4de] transition hover:bg-[#2a2a2a]"
          >
            Try again
          </button>
        </div>
      )}

      {status === "done" && scan && (
        <div className="card-surface flex flex-col gap-4">
          {/* First impression */}
          <div>
            <p className="section-label mb-1">First impression (2 seconds)</p>
            <p className="text-base italic leading-relaxed text-[#e8e4de]">
              &ldquo;{scan.firstImpression}&rdquo;
            </p>
          </div>

          {/* What they noticed */}
          <div>
            <p className="section-label mb-2">What the recruiter noticed</p>
            <ol className="ml-5 list-decimal text-sm leading-relaxed text-[#e8e4de]">
              {scan.sixSecondScan.noticed.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          </div>

          {/* What they missed */}
          {scan.sixSecondScan.missed.length > 0 && (
            <div>
              <p className="section-label mb-2">What they missed (didn&apos;t reach in 6 seconds)</p>
              <ul className="ml-5 list-disc text-sm leading-relaxed text-[#a8a29e]">
                {scan.sixSecondScan.missed.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Red flags */}
          {scan.sixSecondScan.redFlags.length > 0 && (
            <div className="rounded-lg border border-[#fbbf24]/30 bg-[#713f12]/20 p-3">
              <p className="section-label mb-2" style={{ color: "#fbbf24" }}>Red flags noticed</p>
              <ul className="ml-5 list-disc text-sm leading-relaxed text-[#e8e4de]">
                {scan.sixSecondScan.redFlags.map((flag, i) => (
                  <li key={i}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Verdict */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <p className="section-label">Recruiter decision</p>
              <ScanVerdictBadge verdict={scan.advanceOrReject} />
            </div>
            <p className="text-sm leading-relaxed text-[#e8e4de]">
              {scan.advanceReasoning}
            </p>
          </div>

          {/* One thing to change */}
          <div className="rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] p-3">
            <p className="section-label mb-1">Highest-impact change</p>
            <p className="text-sm leading-relaxed text-[#e8e4de]">
              {scan.oneThingToChange}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
