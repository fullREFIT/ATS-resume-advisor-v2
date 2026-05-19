import type { Diagnosis } from "@/lib/types";
import { VerdictBadge, verdictAccentColor } from "@/components/VerdictBadge";

function scoreBarColor(score: number): string {
  if (score >= 70) return "#4ade80";
  if (score >= 50) return "#fbbf24";
  return "#f87171";
}

function ScoreRow({
  label,
  score,
  note,
}: {
  label: string;
  score: number;
  note: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-xs uppercase tracking-[0.08em] text-[#e8e4de]">
          {label}
        </span>
        <span className="font-mono text-sm font-bold text-[#e8e4de]">
          {score}/100
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-[#2a2a2a]"
        aria-hidden
      >
        <div
          style={{
            width: `${Math.max(0, Math.min(100, score))}%`,
            background: scoreBarColor(score),
          }}
          className="h-full transition-all"
        />
      </div>
      <p className="text-xs leading-relaxed text-[#a8a29e]">{note}</p>
    </div>
  );
}

export function DiagnosisCard({ diagnosis }: { diagnosis: Diagnosis }) {
  const parsingHasIssues =
    diagnosis.atsParsingFlags.length > 0 &&
    !(
      diagnosis.atsParsingFlags.length === 1 &&
      /none/i.test(diagnosis.atsParsingFlags[0])
    );

  const sb = diagnosis.scoreBreakdown;
  const accentColor = verdictAccentColor[diagnosis.verdict];

  return (
    <div className="flex flex-col gap-4">
      <section
        className="card-surface"
        style={{ borderTop: `3px solid ${accentColor}` }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="section-label mb-1">Match score</p>
            <p className="font-mono text-5xl font-bold leading-none tracking-tight text-[#e8e4de]">
              {diagnosis.matchScore}
              <span className="text-xl font-normal text-[#a8a29e]">/100</span>
            </p>
          </div>
          <VerdictBadge verdict={diagnosis.verdict} />
        </div>
        <p className="mt-4 text-base leading-relaxed text-[#e8e4de]">
          {diagnosis.verdictReasoning}
        </p>
      </section>

      {sb && (
        <section className="card-surface">
          <p className="section-label mb-3">Why this score</p>
          <div className="flex flex-col gap-4">
            <ScoreRow
              label="Keyword match"
              score={sb.keywordMatch.score}
              note={sb.keywordMatch.note}
            />
            <ScoreRow
              label="Experience relevance"
              score={sb.experienceRelevance.score}
              note={sb.experienceRelevance.note}
            />
            <ScoreRow
              label="Trajectory fit"
              score={sb.trajectoryFit.score}
              note={sb.trajectoryFit.note}
            />
            <ScoreRow
              label="ATS parsing"
              score={sb.atsParsing.score}
              note={sb.atsParsing.note}
            />
          </div>
        </section>
      )}

      {parsingHasIssues && (
        <section className="card-surface" style={{ borderLeft: "3px solid #fbbf24" }}>
          <p className="section-label mb-2" style={{ color: "#fbbf24" }}>
            ATS parsing flags — fix these first
          </p>
          <ul className="ml-5 list-disc text-sm leading-relaxed text-[#e8e4de]">
            {diagnosis.atsParsingFlags.map((flag, i) => (
              <li key={i}>{flag}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-1 gap-4">
        <section className="card-surface">
          <p className="section-label mb-2">Top matches</p>
          <ul className="ml-5 list-disc text-sm leading-relaxed text-[#e8e4de]">
            {diagnosis.topMatches.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </section>
        <section className="card-surface">
          <p className="section-label mb-2">Critical gaps</p>
          <ul className="ml-5 list-disc text-sm leading-relaxed text-[#e8e4de]">
            {diagnosis.criticalGaps.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </section>
      </div>

      {diagnosis.trajectoryNote && (
        <section className="card-surface">
          <p className="section-label mb-2">Career trajectory</p>
          <p className="text-sm leading-relaxed text-[#e8e4de]">
            {diagnosis.trajectoryNote}
          </p>
        </section>
      )}
    </div>
  );
}
