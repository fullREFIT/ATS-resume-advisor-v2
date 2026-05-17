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
                  ? "bg-forge-red text-pure-white"
                  : isComplete
                    ? "bg-carbon-core text-pure-white"
                    : "bg-soft-gray text-echo"
              }`}
            >
              {n}
            </span>
            <span
              className={`hidden text-xs font-medium sm:inline ${
                isActive ? "text-carbon-core" : "text-echo"
              }`}
            >
              {s.label}
            </span>
            {idx < STEPS.length - 1 && (
              <span className="ml-1 hidden h-px flex-1 bg-soft-gray sm:block" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
