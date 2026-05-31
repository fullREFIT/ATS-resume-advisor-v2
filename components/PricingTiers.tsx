"use client";

import { useEffect, useState } from "react";
import { ByokDialog } from "./ByokDialog";
import { loadByokKey } from "@/lib/byok-storage";
import { getUnlockToken } from "@/lib/unlock-client";

interface Props {
  // When set, this component renders as a paywall modal triggered when the
  // free tier is exhausted; otherwise it renders inline on the landing page.
  variant?: "inline" | "paywall";
  onClose?: () => void;
}

export function PricingTiers({ variant = "inline", onClose }: Props) {
  const [byokOpen, setByokOpen] = useState(false);
  const [hasByok, setHasByok] = useState(false);
  const [hasUnlock, setHasUnlock] = useState(false);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  useEffect(() => {
    setHasByok(Boolean(loadByokKey()));
    setHasUnlock(Boolean(getUnlockToken()));
  }, [byokOpen]);

  async function onUnlockClick() {
    setUnlockLoading(true);
    setUnlockError(null);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Could not start checkout.");
      }
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } catch (err) {
      setUnlockLoading(false);
      setUnlockError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  const cards = (
    <div className="grid w-full gap-3 sm:grid-cols-3">
      <Card
        eyebrow="Free"
        headline="2 verdicts per day"
        body="Try it free. No signup. See your match score, ATS parse score, and verdict."
        cta={null}
      />
      <Card
        eyebrow="Bring your own key"
        headline="Unlimited — your cost"
        body="Paste an Anthropic API key (sk-ant-…). Your key, your bill — bypasses our rate limit entirely. Free $5 Anthropic credit on signup ≈ 30 verdicts."
        cta={
          <button
            type="button"
            onClick={() => setByokOpen(true)}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-[#2a2a2a] px-4 text-sm font-medium text-[#e8e4de] hover:bg-[#1a1a1a] transition-colors"
          >
            {hasByok ? "Key set ✓ — edit" : "Add your key"}
          </button>
        }
        status={hasByok ? "Active on this tab" : undefined}
      />
      <Card
        eyebrow="$9 unlock"
        headline="10 full verdicts"
        body="One-time payment, no signup. Unlocks output, cover letter, gap closer, recruiter scan, target persons, and more. Non-refundable digital service."
        accent
        cta={
          <button
            type="button"
            onClick={onUnlockClick}
            disabled={unlockLoading}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#e8e4de] px-4 text-sm font-semibold text-black hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
          >
            {unlockLoading ? "Starting…" : hasUnlock ? "Add 10 more verdicts" : "Unlock for $9"}
          </button>
        }
        status={hasUnlock ? "Unlock active" : undefined}
        error={unlockError ?? undefined}
      />
    </div>
  );

  if (variant === "paywall") {
    return (
      <>
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4 sm:items-center"
          onClick={onClose}
        >
          <div
            className="w-full max-w-3xl rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#a8a29e]">
                Daily limit reached
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#e8e4de]">
                You've used your 2 free verdicts today.
              </h2>
              <p className="mt-2 text-sm text-[#a8a29e]">
                Come back tomorrow, bring your own Anthropic key, or unlock 10 verdicts for $9.
              </p>
            </div>
            {cards}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg border border-[#2a2a2a] px-4 text-sm font-medium text-[#a8a29e] hover:text-[#e8e4de] transition-colors sm:w-auto"
              >
                Close
              </button>
            )}
          </div>
        </div>
        <ByokDialog open={byokOpen} onClose={() => setByokOpen(false)} />
      </>
    );
  }

  return (
    <>
      {cards}
      <ByokDialog open={byokOpen} onClose={() => setByokOpen(false)} />
    </>
  );
}

interface CardProps {
  eyebrow: string;
  headline: string;
  body: string;
  cta: React.ReactNode | null;
  accent?: boolean;
  status?: string;
  error?: string;
}

function Card({ eyebrow, headline, body, cta, accent, status, error }: CardProps) {
  return (
    <div
      className={
        accent
          ? "rounded-xl border border-[#e8e4de] bg-[#0a0a0a] p-5 ring-1 ring-[#e8e4de]/30"
          : "rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] p-5"
      }
    >
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#a8a29e]">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-lg font-semibold tracking-tight text-[#e8e4de]">
        {headline}
      </h3>
      <p className="mt-2 text-sm text-[#a8a29e]">{body}</p>
      {status && (
        <p className="mt-3 text-xs font-medium text-green-400">{status}</p>
      )}
      {error && (
        <p className="mt-3 text-xs font-medium text-red-400">{error}</p>
      )}
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}
