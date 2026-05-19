"use client";

import { useEffect, useState } from "react";
import type { Diagnosis, GapCloserAction, GapCloserPlan, Verdict } from "@/lib/types";

const VERDICT_STYLE: Record<"GO" | "FIX_FIRST", { background: string; color: string; label: string }> = {
  GO: { background: "#14532d", color: "#4ade80", label: "GO" },
  FIX_FIRST: { background: "#713f12", color: "#fbbf24", label: "FIX FIRST" },
};

function SmallVerdictBadge({ verdict }: { verdict: "GO" | "FIX_FIRST" }) {
  const s = VERDICT_STYLE[verdict];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 4,
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: "0.1em",
        fontFamily: "var(--font-jetbrains-mono, monospace)",
        background: s.background,
        color: s.color,
      }}
    >
      {s.label}
    </span>
  );
}

function ActionCard({ action }: { action: GapCloserAction }) {
  return (
    <div className="card-surface flex flex-col gap-1">
      <p className="text-sm font-semibold leading-snug text-carbon-core">{action.action}</p>
      <p className="text-xs leading-relaxed text-echo">
        <span className="font-medium text-carbon-core">Why:</span> {action.why}
      </p>
      <p className="text-xs text-echo">
        <span className="font-medium text-carbon-core">Impact:</span> {action.estimatedScoreImpact}
      </p>
      {action.resource && (
        <p className="text-xs text-echo">
          <span className="font-medium text-carbon-core">Resource:</span>{" "}
          {action.resource.startsWith("http") ? (
            <a
              href={action.resource}
              target="_blank"
              rel="noopener noreferrer"
              className="text-forge-red underline"
            >
              {action.resource}
            </a>
          ) : (
            action.resource
          )}
        </p>
      )}
    </div>
  );
}

interface Props {
  verdict: Verdict;
  resume: string;
  jd: string;
  diagnosis: Diagnosis;
}

export function GapCloser({ verdict, resume, jd, diagnosis }: Props) {
  const [plan, setPlan] = useState<GapCloserPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shouldFetch = verdict === "FIX_FIRST" || verdict === "PASS";

  useEffect(() => {
    if (!shouldFetch) return;
    let cancelled = false;
    async function fetchPlan() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/demo/gap-closer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume, jd, diagnosis }),
        });
        const data = (await res.json()) as { plan?: GapCloserPlan; error?: string };
        if (cancelled) return;
        if (!res.ok || !data.plan) {
          throw new Error(data.error ?? `Request failed (${res.status}).`);
        }
        setPlan(data.plan);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "An error occurred.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void fetchPlan();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetch]);

  // Only renders for FIX_FIRST or PASS
  if (!shouldFetch) return null;

  if (loading) {
    return (
      <section className="flex flex-col gap-3">
        <p className="section-label">Gap Closer — 30/60/90-Day Plan</p>
        <div className="card-surface flex flex-col gap-3">
          <div className="h-4 w-3/4 animate-pulse rounded bg-soft-gray" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-soft-gray" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-soft-gray" />
          <p className="text-xs text-echo">Building your action plan...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex flex-col gap-3">
        <p className="section-label">Gap Closer — 30/60/90-Day Plan</p>
        <p className="rounded-lg border border-forge-red/30 bg-forge-red/10 p-3 text-sm text-forge-red">
          {error}
        </p>
      </section>
    );
  }

  if (!plan) return null;

  const columns = [
    { label: "30 Days", actions: plan.thirtyDays },
    { label: "60 Days", actions: plan.sixtyDays },
    { label: "90 Days", actions: plan.ninetyDays },
  ];

  return (
    <section className="flex flex-col gap-4">
      <p className="section-label">Gap Closer — 30/60/90-Day Plan</p>

      {/* Three columns on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {columns.map(({ label, actions }) => (
          <div key={label} className="flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-carbon-core font-mono">
              {label}
            </p>
            {actions.length === 0 ? (
              <p className="text-xs text-echo">No actions for this period.</p>
            ) : (
              actions.map((a, i) => <ActionCard key={i} action={a} />)
            )}
          </div>
        ))}
      </div>

      {/* Structural gaps */}
      {plan.structuralGaps.length > 0 && (
        <div className="card-surface border-l-[3px] border-l-echo">
          <p className="section-label mb-2">Gaps that require time, not coursework</p>
          <ul className="ml-5 list-disc text-sm leading-relaxed text-carbon-core">
            {plan.structuralGaps.map((gap, i) => (
              <li key={i}>{gap}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Projected score bottom bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-soft-gray bg-ash-white px-4 py-3">
        <span className="text-sm font-medium text-carbon-core">
          Current score:{" "}
          <span className="font-bold">{diagnosis.matchScore}/100</span>
        </span>
        <span className="text-echo">→</span>
        <span className="text-sm font-medium text-carbon-core">
          Projected after 90 days:{" "}
          <span className="font-bold">{plan.projectedScoreAfter90Days}/100</span>
        </span>
        <SmallVerdictBadge verdict={plan.projectedVerdict} />
      </div>
    </section>
  );
}
