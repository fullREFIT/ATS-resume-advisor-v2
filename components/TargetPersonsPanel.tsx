"use client";

import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import type { TargetPersonArchetype, TargetPersonsResponse } from "@/lib/types";

export interface TargetPersonsPanelProps {
  archetypes: TargetPersonArchetype[] | null;
  onFetch: () => Promise<void>;
}

export function TargetPersonsPanel({
  archetypes,
  onFetch,
}: TargetPersonsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      await onFetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!archetypes || archetypes.length === 0) {
    return (
      <section className="card-surface" style={{ borderLeft: "3px solid #4ade80" }}>
        <p className="section-label mb-2">Who to send this to</p>
        <p className="mb-4 text-sm leading-relaxed text-[#e8e4de]">
          A great cold message lands on the right person. Surface 3–5 role
          archetypes at this company who are the right recipients of your
          draft, with tailored opening lines and copy-pastable LinkedIn search
          strings.
        </p>
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className="inline-flex min-h-[48px] items-center justify-center rounded-md bg-[#4ade80] px-5 text-sm font-medium text-[#0a0a0a] transition hover:bg-[#22c55e] disabled:opacity-60"
        >
          {loading ? "Finding people…" : "Find people to send this to →"}
        </button>
        {error && (
          <p className="mt-3 text-sm text-[#f87171]" role="alert">
            {error}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="card-surface" style={{ borderLeft: "3px solid #4ade80" }}>
        <p className="section-label mb-1">Who to send this to</p>
        <p className="text-xs text-[#a8a29e]">
          {archetypes.length} role archetypes. Pick one, copy the opening line,
          search for the person, send.
        </p>
      </div>

      {archetypes.map((a, i) => (
        <article
          key={i}
          className="card-surface flex flex-col gap-3"
          aria-label={`Archetype ${i + 1}: ${a.roleTitle}`}
        >
          <header>
            <h3 className="text-lg font-semibold tracking-tight text-[#e8e4de]">
              {a.roleTitle}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-[#a8a29e]">
              {a.whyThisRole}
            </p>
          </header>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="section-label">Opening line</p>
              <CopyButton text={a.openingLine} />
            </div>
            <p className="text-sm leading-relaxed text-[#e8e4de]">
              {a.openingLine}
            </p>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="section-label">LinkedIn search</p>
              <CopyButton text={a.linkedinSearchString} />
            </div>
            <p className="break-all font-mono text-xs text-[#e8e4de]">
              {a.linkedinSearchString}
            </p>
            <p className="mt-1 text-xs text-[#a8a29e]">
              Paste into Google. The top results will be public LinkedIn
              profiles of people in this role at the company.
            </p>
          </div>

          <div>
            <p className="section-label mb-1">Sales Navigator hint</p>
            <p className="text-xs leading-relaxed text-[#a8a29e]">
              {a.salesNavSearchHint}
            </p>
          </div>
        </article>
      ))}
    </section>
  );
}

export type { TargetPersonsResponse };
