import Link from "next/link";

export function Header() {
  return (
    <header className="w-full border-b border-[#2a2a2a] bg-[#0a0a0a]">
      <div className="mx-auto flex max-w-[720px] items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="flex flex-col">
          <span className="text-base font-semibold tracking-tight text-[#e8e4de] sm:text-lg">
            Resume Verdict
          </span>
          <span className="hidden text-[0.75rem] text-[#a8a29e] sm:block">
            Honest diagnosis. No fabrication. ATS-optimized.
          </span>
        </Link>
        <Link
          href="/about"
          className="inline-flex min-h-11 items-center text-sm font-medium text-[#a8a29e] hover:text-[#e8e4de] transition-colors"
        >
          How it works
        </Link>
      </div>
    </header>
  );
}
