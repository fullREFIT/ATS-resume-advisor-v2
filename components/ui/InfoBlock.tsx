import type { ReactNode } from "react";

type Tone = "accent" | "muted" | "gold";

const toneClasses: Record<Tone, string> = {
  accent: "border-l-[#4ade80]",
  muted: "border-l-[#a8a29e]",
  gold: "border-l-[#fbbf24]",
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
      className={`flex gap-3 rounded-lg border border-[#2a2a2a] border-l-[3px] bg-[#1a1a1a] p-4 text-sm leading-relaxed text-[#e8e4de] ${toneClasses[tone]}`}
    >
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
