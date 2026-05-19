const STEPS = [
  { label: "Paste" },
  { label: "Diagnose" },
  { label: "Refine" },
  { label: "Result" },
];

export function ProgressBar({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <ol
      aria-label="Progress"
      className="flex w-full items-center justify-between gap-2"
    >
      {STEPS.map((s, idx) => {
        const n = idx + 1;
        const isActive = n === step;
        const isComplete = n < step;
        return (
          <li
            key={s.label}
            className="flex flex-1 items-center gap-2"
          >
            <span
              aria-current={isActive ? "step" : undefined}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold ${
                isActive
                  ? "bg-[#4ade80] text-[#0a0a0a]"
                  : isComplete
                    ? "bg-[#e8e4de] text-[#0a0a0a]"
                    : "bg-[#2a2a2a] text-[#a8a29e]"
              }`}
            >
              {n}
            </span>
            <span
              className={`hidden text-xs font-medium sm:inline ${
                isActive ? "text-[#e8e4de]" : "text-[#a8a29e]"
              }`}
            >
              {s.label}
            </span>
            {idx < STEPS.length - 1 && (
              <span className="ml-1 hidden h-px flex-1 bg-[#2a2a2a] sm:block" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
