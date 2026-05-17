import type { InterviewPrep as InterviewPrepData } from "@/lib/types";

export function InterviewPrep({ prep }: { prep: InterviewPrepData }) {
  return (
    <div className="flex flex-col gap-4">
      <section className="card-surface">
        <p className="section-label mb-2">Likely questions</p>
        <ul className="ml-5 list-disc text-sm leading-relaxed text-carbon-core">
          {prep.likelyQuestions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      </section>
      <section className="card-surface">
        <p className="section-label mb-2">STAR stories to prep</p>
        <ul className="ml-5 list-disc text-sm leading-relaxed text-carbon-core">
          {prep.starStoriesToPrep.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </section>
      <section className="card-surface">
        <p className="section-label mb-2">Addressing weak spots</p>
        <ul className="ml-5 list-disc text-sm leading-relaxed text-carbon-core">
          {prep.weakSpotResponses.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
