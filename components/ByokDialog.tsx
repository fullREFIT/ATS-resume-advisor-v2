"use client";

import { useEffect, useState } from "react";
import {
  clearByokKey,
  isValidAnthropicKeyFormat,
  loadByokKey,
  saveByokKey,
} from "@/lib/byok-storage";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ByokDialog({ open, onClose }: Props) {
  const [value, setValue] = useState("");
  const [hasSaved, setHasSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const existing = loadByokKey();
      setValue(existing ?? "");
      setHasSaved(Boolean(existing));
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  function onSave() {
    const trimmed = value.trim();
    if (!isValidAnthropicKeyFormat(trimmed)) {
      setError("Key must start with sk-ant- and be at least 48 characters.");
      return;
    }
    saveByokKey(trimmed);
    setHasSaved(true);
    setError(null);
    onClose();
  }

  function onRemove() {
    clearByokKey();
    setValue("");
    setHasSaved(false);
    setError(null);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#a8a29e]">
          Bring your own key
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#e8e4de]">
          Unlimited verdicts with your Anthropic API key.
        </h2>
        <p className="mt-3 text-sm text-[#a8a29e]">
          Your key stays in this browser tab only — never saved to our server,
          never logged. We use it for one LLM call per request and discard it.
          You pay Anthropic directly. Get a key at{" "}
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#e8e4de] underline hover:text-white"
          >
            console.anthropic.com
          </a>{" "}
          — signup includes $5 free credit (~30 verdicts on this app).
        </p>
        <label className="mt-5 block text-xs uppercase tracking-[0.08em] text-[#a8a29e]">
          sk-ant-… key
        </label>
        <input
          type="password"
          autoComplete="off"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          placeholder="sk-ant-…"
          className="mt-2 min-h-12 w-full rounded-lg border border-[#2a2a2a] bg-black px-3 text-base text-[#e8e4de] placeholder-[#5a5a5a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8e4de]"
        />
        {error && (
          <p className="mt-2 text-sm text-red-400">{error}</p>
        )}
        {hasSaved && !error && (
          <p className="mt-2 text-sm text-green-400">
            Key loaded. You'll bypass the daily limit on the next verdict.
          </p>
        )}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-between">
          {hasSaved ? (
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#2a2a2a] px-4 text-sm font-medium text-[#a8a29e] hover:bg-[#1a1a1a] hover:text-[#e8e4de] transition-colors"
            >
              Clear key
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2 sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#2a2a2a] px-4 text-sm font-medium text-[#a8a29e] hover:bg-[#1a1a1a] hover:text-[#e8e4de] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#e8e4de] px-4 text-sm font-semibold text-black hover:bg-white transition-colors"
            >
              Save key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
