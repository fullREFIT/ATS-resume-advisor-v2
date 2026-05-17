"use client";

import { useRef, useState } from "react";

interface Props {
  onParsed: (text: string) => void;
}

const ACCEPT = ".pdf,.docx,.txt,.md";

export function ResumeUpload({ onParsed }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handle(file: File) {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/parse", { method: "POST", body: fd });
      const data = (await res.json()) as {
        text?: string;
        charCount?: number;
        needsPaste?: boolean;
        warning?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to parse this file.");
      }
      if (data.text && data.text.length > 0) {
        onParsed(data.text);
      }
      if (data.warning) {
        setInfo(data.warning);
      } else {
        setInfo(`Parsed ${data.charCount ?? 0} characters from ${file.name}.`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-soft-gray bg-pure-white px-4 text-sm font-medium text-carbon-core transition-colors hover:bg-soft-gray/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-red disabled:opacity-50"
        >
          {busy ? "Parsing…" : "Upload .pdf or .docx"}
        </button>
        <span className="text-xs text-echo">
          Or paste plain text below.
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handle(f);
          // Reset value so the same file can be re-uploaded.
          if (inputRef.current) inputRef.current.value = "";
        }}
      />
      {info && (
        <p className="text-xs text-echo" role="status">
          {info}
        </p>
      )}
      {error && (
        <p className="text-xs text-forge-red" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
