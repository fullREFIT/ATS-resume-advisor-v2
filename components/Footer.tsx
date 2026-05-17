export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-soft-gray bg-pure-white">
      <div className="mx-auto flex max-w-[720px] flex-col gap-2 px-4 py-6 text-sm text-carbon-core sm:px-6">
        <p>
          Find this useful? Learn more at{" "}
          <a
            href="https://fullrefit.com"
            className="font-medium text-forge-red hover:text-forge-red-hover"
            target="_blank"
            rel="noopener noreferrer"
          >
            fullREFIT.com
          </a>
        </p>
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-echo">
          Built with Claude Code
        </p>
      </div>
    </footer>
  );
}
