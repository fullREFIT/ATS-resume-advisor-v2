import type { Verdict } from "@/lib/types";

const LABELS: Record<Verdict, string> = {
  GO: "GO — Apply with tailoring",
  FIX_FIRST: "FIX FIRST — Real chance, add evidence",
  PASS: "PASS — Recommend not applying",
};

const STYLE: Record<Verdict, { background: string; color: string }> = {
  GO: { background: "#14532d", color: "#4ade80" },
  FIX_FIRST: { background: "#713f12", color: "#fbbf24" },
  PASS: { background: "#7f1d1d", color: "#f87171" },
};

export const verdictAccentColor: Record<Verdict, string> = {
  GO: "#4ade80",
  FIX_FIRST: "#fbbf24",
  PASS: "#f87171",
};

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const s = STYLE[verdict];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "8px 12px",
        borderRadius: 6,
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: "0.1em",
        fontFamily: "var(--ls-mono, ui-monospace, monospace)",
        background: s.background,
        color: s.color,
        whiteSpace: "normal",
        maxWidth: "100%",
        wordBreak: "normal",
        overflowWrap: "anywhere",
        lineHeight: 1.4,
      }}
    >
      {LABELS[verdict]}
    </span>
  );
}
