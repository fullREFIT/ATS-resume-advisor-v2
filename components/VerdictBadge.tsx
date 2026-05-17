import type { Verdict } from "@/lib/types";

const LABELS: Record<Verdict, string> = {
  GO: "GO — Apply with tailoring",
  FIX_FIRST: "FIX FIRST — Real chance, add evidence",
  PASS: "PASS — Recommend not applying",
};

const STYLE: Record<Verdict, string> = {
  GO: "bg-forge-red text-pure-white",
  FIX_FIRST: "bg-forge-gold text-carbon-core",
  PASS: "bg-echo text-pure-white",
};

export const verdictAccentClass: Record<Verdict, string> = {
  GO: "border-t-forge-red",
  FIX_FIRST: "border-t-forge-gold",
  PASS: "border-t-echo",
};

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center self-start rounded-md px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.1em] ${STYLE[verdict]}`}
    >
      {LABELS[verdict]}
    </span>
  );
}
