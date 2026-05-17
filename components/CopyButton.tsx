"use client";

import { useState } from "react";

export function CopyButton({
  text,
  label = "Copy",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  async function onClick() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-9 items-center gap-1 rounded-md border border-soft-gray bg-pure-white px-3 text-xs font-medium text-carbon-core transition-colors hover:bg-soft-gray/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-red"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
