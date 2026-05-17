import Link from "next/link";

export function Header() {
  return (
    <header className="w-full border-b border-soft-gray bg-pure-white">
      <div className="mx-auto flex max-w-[720px] items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="flex flex-col">
          <span className="text-base font-semibold tracking-tight text-carbon-core sm:text-lg">
            AI Resume Advisor
          </span>
          <span className="hidden text-[0.75rem] text-echo sm:block">
            Honest diagnosis. No fabrication. ATS-optimized.
          </span>
        </Link>
        <Link
          href="/about"
          className="inline-flex min-h-11 items-center text-sm font-medium text-forge-red hover:text-forge-red-hover"
        >
          How it works
        </Link>
      </div>
    </header>
  );
}
