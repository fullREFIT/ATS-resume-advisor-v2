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
      <section className="card-surface border-l-[3px] border-l-forge-red">
        <p className="section-label mb-2">Who to send this to</p>
        <p className="mb-4 text-sm leading-relaxed text-carbon-core">
          A great cold message lands on the right person. Surface 3–5 role
          archetypes at this company who are the right recipients of your
          draft, with tailored opening lines and copy-pastable LinkedIn search
          strings.
        </p>
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className="inline-flex min-h-[48px] items-center justify-center rounded-md bg-forge-red px-5 text-sm font-medium text-white transition hover:bg-forge-red-dark disabled:opacity-60"
        >
          {loading ? "Finding people…" : "Find people to send this to →"}
        </button>
        {error && (
          <p className="mt-3 text-sm text-forge-red" role="alert">
            {error}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="card-surface border-l-[3px] border-l-forge-red">
        <p className="section-label mb-1">Who to send this to</p>
        <p className="text-xs text-echo">
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
            <h3 className="text-lg font-semibold tracking-tight text-carbon-core">
              {a.roleTitle}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-echo">
              {a.whyThisRole}
            </p>
          </header>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="section-label">Opening line</p>
              <CopyButton text={a.openingLine} />
            </div>
            <p className="text-sm leading-relaxed text-carbon-core">
              {a.openingLine}
            </p>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="section-label">LinkedIn search</p>
              <CopyButton text={a.linkedinSearchString} />
            </div>
            <p className="break-all font-mono text-xs text-carbon-core">
              {a.linkedinSearchString}
            </p>
            <p className="mt-1 text-xs text-echo">
              Paste into Google. The top results will be public LinkedIn
              profiles of people in this role at the company.
            </p>
          </div>

          <div>
            <p className="section-label mb-1">Sales Navigator hint</p>
            <p className="text-xs leading-relaxed text-echo">
              {a.salesNavSearchHint}
            </p>
          </div>
        </article>
      ))}
    </section>
  );
}

export type { TargetPersonsResponse };
