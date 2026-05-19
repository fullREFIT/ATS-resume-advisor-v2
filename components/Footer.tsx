export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-[#2a2a2a] bg-[#0a0a0a]">
      <div className="mx-auto flex max-w-[720px] flex-col gap-2 px-4 py-6 text-sm text-[#e8e4de] sm:px-6">
        <p>
          Find this useful? Learn more at{" "}
          <a
            href="https://fullrefit.com"
            className="font-medium text-[#4ade80] hover:text-[#22c55e]"
            target="_blank"
            rel="noopener noreferrer"
          >
            fullREFIT.com
          </a>
        </p>
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[#a8a29e]">
          Built with Claude Code
        </p>
      </div>
    </footer>
  );
}
