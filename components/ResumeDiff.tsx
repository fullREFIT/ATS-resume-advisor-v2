"use client";

import { useMemo, useState, type ReactNode } from "react";
import { diffWords, type Change } from "diff";

interface ResumeDiffProps {
  originalText: string;
  tailoredText: string;
  children: ReactNode;
}

type Mode = "tailored" | "diff";

function countPhrases(parts: Change[], pick: (c: Change) => boolean): number {
  return parts.filter((p) => pick(p) && p.value.trim().length > 0).length;
}

function preservedPercent(parts: Change[]): number {
  let unchangedChars = 0;
  let totalChars = 0;
  for (const p of parts) {
    if (p.added) {
      totalChars += p.value.length;
    } else if (p.removed) {
      totalChars += p.value.length;
    } else {
      unchangedChars += p.value.length;
      totalChars += p.value.length;
    }
  }
  if (totalChars === 0) return 0;
  return Math.round((unchangedChars / totalChars) * 100);
}

export function ResumeDiff({
  originalText,
  tailoredText,
  children,
}: ResumeDiffProps) {
  const [mode, setMode] = useState<Mode>("tailored");

  const parts = useMemo(() => {
    if (!originalText || !tailoredText) return [];
    return diffWords(originalText, tailoredText);
  }, [originalText, tailoredText]);

  const addedCount = useMemo(
    () => countPhrases(parts, (p) => p.added === true),
    [parts],
  );
  const removedCount = useMemo(
    () => countPhrases(parts, (p) => p.removed === true),
    [parts],
  );
  const preserved = useMemo(() => preservedPercent(parts), [parts]);

  const canDiff = originalText.length > 0 && tailoredText.length > 0;

  return (
    <section className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label="Resume view mode"
        className="flex flex-wrap gap-2"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "tailored"}
          onClick={() => setMode("tailored")}
          style={{
            minHeight: 44,
            padding: "10px 18px",
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "var(--ls-sans), sans-serif",
            background: mode === "tailored" ? "#1a1a1a" : "transparent",
            color: mode === "tailored" ? "#e8e4de" : "#78716c",
            border:
              mode === "tailored"
                ? "1px solid #4ade80"
                : "1px solid #2a2a2a",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          Tailored Resume
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "diff"}
          onClick={() => setMode("diff")}
          disabled={!canDiff}
          style={{
            minHeight: 44,
            padding: "10px 18px",
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "var(--ls-sans), sans-serif",
            background: mode === "diff" ? "#1a1a1a" : "transparent",
            color: mode === "diff" ? "#e8e4de" : "#78716c",
            border:
              mode === "diff" ? "1px solid #4ade80" : "1px solid #2a2a2a",
            cursor: canDiff ? "pointer" : "not-allowed",
            opacity: canDiff ? 1 : 0.5,
            transition: "all 0.15s",
          }}
        >
          View Changes
        </button>
      </div>

      {mode === "diff" && canDiff && (
        <>
          <p
            className="text-xs"
            style={{
              fontFamily: "var(--ls-mono), ui-monospace, monospace",
              color: "#a8a29e",
            }}
          >
            {addedCount} {addedCount === 1 ? "phrase" : "phrases"} added ·{" "}
            {removedCount} {removedCount === 1 ? "phrase" : "phrases"} removed ·{" "}
            {preserved}% of original preserved
          </p>

          <div
            className="card-surface"
            style={{
              padding: 20,
              fontFamily: "var(--ls-mono), ui-monospace, monospace",
              fontSize: 13,
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {parts.map((part, i) => {
              if (part.added) {
                return (
                  <span
                    key={i}
                    style={{
                      background: "rgba(74, 222, 128, 0.15)",
                      color: "#4ade80",
                      textDecoration: "underline",
                    }}
                  >
                    {part.value}
                  </span>
                );
              }
              if (part.removed) {
                return (
                  <span
                    key={i}
                    style={{
                      background: "rgba(248, 113, 113, 0.15)",
                      color: "#f87171",
                      textDecoration: "line-through",
                    }}
                  >
                    {part.value}
                  </span>
                );
              }
              return (
                <span key={i} style={{ color: "#78716c" }}>
                  {part.value}
                </span>
              );
            })}
          </div>

          <div
            className="flex flex-wrap items-center gap-4"
            style={{
              fontFamily: "var(--ls-mono), ui-monospace, monospace",
              fontSize: 12,
              color: "#78716c",
            }}
          >
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden
                style={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  background: "rgba(74, 222, 128, 0.4)",
                  border: "1px solid #4ade80",
                  borderRadius: 2,
                }}
              />
              Added from job description language
            </span>
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden
                style={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  background: "rgba(248, 113, 113, 0.4)",
                  border: "1px solid #f87171",
                  borderRadius: 2,
                }}
              />
              Removed from original
            </span>
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden
                style={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  background: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  borderRadius: 2,
                }}
              />
              Unchanged
            </span>
          </div>
        </>
      )}

      {mode === "tailored" && <div>{children}</div>}
    </section>
  );
}
