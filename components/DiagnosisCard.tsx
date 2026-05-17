import type { Diagnosis } from "@/lib/types";
import { VerdictBadge, verdictAccentClass } from "@/components/VerdictBadge";

function ScoreRow({
  label,
  score,
  note,
}: {
  label: string;
  score: number;
  note: string;
}) {
  const tone =
    score >= 75
      ? "bg-forge-red"
      : score >= 50
        ? "bg-forge-gold"
        : "bg-echo";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-xs uppercase tracking-[0.08em] text-carbon-core">
          {label}
        </span>
        <span className="font-mono text-sm font-bold text-carbon-core">
          {score}/100
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-soft-gray"
        aria-hidden
      >
        <div
          className={`h-full ${tone} transition-all`}
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
        />
      </div>
      <p className="text-xs leading-relaxed text-echo">{note}</p>
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

  return (
    <div className="flex flex-col gap-4">
      <section
        className={`card-surface border-t-[3px] ${verdictAccentClass[diagnosis.verdict]}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="section-label mb-1">Match score</p>
            <p className="font-mono text-5xl font-bold leading-none tracking-tight text-carbon-core">
              {diagnosis.matchScore}
              <span className="text-xl font-normal text-echo">/100</span>
            </p>
          </div>
          <VerdictBadge verdict={diagnosis.verdict} />
        </div>
        <p className="mt-4 text-base leading-relaxed text-carbon-core">
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
        <section className="card-surface border-l-[3px] border-l-forge-gold">
          <p className="section-label mb-2 text-forge-dark">
            ATS parsing flags — fix these first
          </p>
          <ul className="ml-5 list-disc text-sm leading-relaxed text-carbon-core">
            {diagnosis.atsParsingFlags.map((flag, i) => (
              <li key={i}>{flag}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-1 gap-4">
        <section className="card-surface">
          <p className="section-label mb-2">Top matches</p>
          <ul className="ml-5 list-disc text-sm leading-relaxed text-carbon-core">
            {diagnosis.topMatches.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </section>
        <section className="card-surface">
          <p className="section-label mb-2">Critical gaps</p>
          <ul className="ml-5 list-disc text-sm leading-relaxed text-carbon-core">
            {diagnosis.criticalGaps.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </section>
      </div>

      {diagnosis.trajectoryNote && (
        <section className="card-surface">
          <p className="section-label mb-2">Career trajectory</p>
          <p className="text-sm leading-relaxed text-carbon-core">
            {diagnosis.trajectoryNote}
          </p>
        </section>
      )}
    </div>
  );
}
