"use client";

import { useEffect, useState } from "react";
import { clearHistory, loadHistory, type HistoryEntry } from "@/lib/storage";
import type { Verdict } from "@/lib/types";

const VERDICT_STYLE: Record<Verdict, { bg: string; color: string; label: string }> = {
  GO: { bg: "#14532d", color: "#4ade80", label: "GO" },
  FIX_FIRST: { bg: "#713f12", color: "#fbbf24", label: "FIX FIRST" },
  PASS: { bg: "#7f1d1d", color: "#f87171", label: "PASS" },
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - ts;
  const ONE_DAY = 86400000;

  if (diff < ONE_DAY && d.getDate() === now.getDate()) return "Today";
  if (diff < ONE_DAY * 2 && d.getDate() === now.getDate() - 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function HistoryVerdictBadge({ verdict }: { verdict: Verdict }) {
  const s = VERDICT_STYLE[verdict];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 4,
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: "0.08em",
        fontFamily: "var(--font-jetbrains-mono, monospace)",
        background: s.bg,
        color: s.color,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

export function SessionHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  if (history.length === 0) return null;

  function handleClear() {
    if (window.confirm("Clear your entire history? This cannot be undone.")) {
      clearHistory();
      setHistory([]);
    }
  }

  const shown = expanded ? history : history.slice(0, 5);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="section-label">Your history</p>
        <button
          onClick={handleClear}
          className="text-xs text-echo underline hover:text-carbon-core"
        >
          Clear history
        </button>
      </div>

      <div className="card-surface overflow-hidden p-0">
        <table className="w-full text-sm">
          <tbody>
            {shown.map((entry, i) => (
              <tr
                key={entry.id}
                className={`border-b border-soft-gray last:border-b-0 ${i % 2 === 0 ? "bg-pure-white" : "bg-ash-white"}`}
              >
                {/* Date */}
                <td className="px-3 py-2 text-xs text-echo whitespace-nowrap">
                  {formatDate(entry.date)}
                </td>

                {/* Mode icon */}
                <td className="px-3 py-2 text-xs text-echo">
                  {entry.mode === "role" ? "💼" : "🏢"}
                </td>

                {/* Job title or company name */}
                <td className="px-3 py-2 text-xs text-carbon-core max-w-[180px] truncate">
                  {entry.mode === "role"
                    ? (entry.jobTitle ?? "Unknown role")
                    : (entry.companyName ?? "Unknown company")}
                </td>

                {/* Verdict or label */}
                <td className="px-3 py-2">
                  {entry.mode === "role" && entry.verdict ? (
                    <HistoryVerdictBadge verdict={entry.verdict} />
                  ) : (
                    <span className="text-xs text-echo font-mono">Cold Outreach</span>
                  )}
                </td>

                {/* Score */}
                <td className="px-3 py-2 text-xs font-mono text-echo whitespace-nowrap">
                  {entry.mode === "role" && entry.matchScore != null
                    ? `${entry.matchScore}/100`
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {history.length > 5 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-echo underline hover:text-carbon-core self-start"
        >
          {expanded ? "Show less" : `Show all ${history.length} entries`}
        </button>
      )}
    </section>
  );
}
