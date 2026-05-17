import type { ExperienceEntry } from "@/lib/types";

const NEW_FROM_INTAKE = /^new from intake$/i;

export function TailoredExperience({
  experience,
}: {
  experience: ExperienceEntry[];
}) {
  return (
    <div className="flex flex-col gap-4">
      {experience.map((role, ri) => (
        <section key={ri} className="card-surface">
          <div className="mb-3 flex flex-col gap-1 border-b border-soft-gray pb-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-base font-semibold text-carbon-core">
                {role.title}{" "}
                <span className="font-normal text-echo">at</span>{" "}
                <span className="font-semibold">{role.company}</span>
              </h3>
              <span className="font-mono text-xs uppercase tracking-[0.08em] text-echo">
                {role.dates}
              </span>
            </div>
            {role.location && (
              <p className="text-xs text-echo">{role.location}</p>
            )}
          </div>
          <ol className="flex flex-col gap-3">
            {role.bullets.map((b, bi) => {
              const isNew = NEW_FROM_INTAKE.test((b.original ?? "").trim());
              return (
                <li key={bi} className="flex flex-col gap-1">
                  {isNew && (
                    <span className="font-mono text-[0.625rem] uppercase tracking-[0.1em] text-forge-red">
                      New from intake
                    </span>
                  )}
                  {!isNew && b.original && (
                    <p className="text-xs leading-relaxed text-echo line-through">
                      {b.original}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed text-carbon-core">
                    {b.rewritten}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
