"use client";

import type { IntakeMode } from "@/lib/types";

interface Props {
  value: IntakeMode;
  onChange: (m: IntakeMode) => void;
}

const OPTIONS: { value: IntakeMode; label: string; sub: string }[] = [
  {
    value: "role",
    label: "I'm applying to a specific role",
    sub: "Paste a job description. The tool diagnoses fit and tailors against it.",
  },
  {
    value: "company",
    label: "I want to target a company that isn't actively hiring",
    sub: "Paste a company website URL. The tool reads what they do and positions you for cold outreach.",
  },
];

export function ModeToggle({ value, onChange }: Props) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="section-label mb-2">What are you trying to do?</legend>
      <div className="flex flex-col gap-2">
        {OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border bg-[#1a1a1a] p-3 transition-colors ${
                active
                  ? "border-[#4ade80] ring-1 ring-[#4ade80]"
                  : "border-[#2a2a2a] hover:border-[#a8a29e]"
              }`}
            >
              <input
                type="radio"
                name="intake-mode"
                value={opt.value}
                checked={active}
                onChange={() => onChange(opt.value)}
                className="mt-1 h-4 w-4 shrink-0 accent-[#4ade80]"
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-[#e8e4de]">
                  {opt.label}
                </span>
                <span className="text-xs text-[#a8a29e]">{opt.sub}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
