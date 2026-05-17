import type { CompanyFit } from "@/lib/types";

export function CompanyFitCard({ fit }: { fit: CompanyFit }) {
  return (
    <div className="flex flex-col gap-4">
      <section className="card-surface border-t-[3px] border-t-forge-red">
        <p className="section-label mb-1">Company</p>
        <h2 className="text-2xl font-semibold tracking-tight text-carbon-core">
          {fit.companyName || "Unknown"}
        </h2>
        <p className="mt-3 text-xs text-echo">{fit.confidenceNote}</p>
      </section>

      <section className="card-surface">
        <p className="section-label mb-2">What they appear to value</p>
        <ul className="ml-5 list-disc text-sm leading-relaxed text-carbon-core">
          {fit.valuesObserved.map((v, i) => (
            <li key={i}>{v}</li>
          ))}
        </ul>
      </section>

      <section className="card-surface">
        <p className="section-label mb-2">Roles they likely hire</p>
        <ul className="ml-5 list-disc text-sm leading-relaxed text-carbon-core">
          {fit.rolesLikelyHired.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </section>

      <section className="card-surface">
        <p className="section-label mb-2">Where your background maps</p>
        <ul className="ml-5 list-disc text-sm leading-relaxed text-carbon-core">
          {fit.whereBackgroundMaps.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </section>

      <section className="card-surface border-l-[3px] border-l-forge-gold">
        <p className="section-label mb-2 text-forge-dark">
          Gaps that would weaken the cold pitch
        </p>
        <ul className="ml-5 list-disc text-sm leading-relaxed text-carbon-core">
          {fit.outreachGaps.map((g, i) => (
            <li key={i}>{g}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
