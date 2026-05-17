import type { ReactNode } from "react";

type Tone = "accent" | "muted" | "gold";

const toneClasses: Record<Tone, string> = {
  accent: "border-l-forge-red",
  muted: "border-l-echo",
  gold: "border-l-forge-gold",
};

export function InfoBlock({
  tone = "accent",
  icon,
  children,
}: {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex gap-3 rounded-lg border border-soft-gray border-l-[3px] bg-pure-white p-4 text-sm leading-relaxed text-carbon-core ${toneClasses[tone]}`}
    >
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
