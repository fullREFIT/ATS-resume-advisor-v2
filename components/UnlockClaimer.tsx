"use client";

import { useEffect, useState } from "react";
import { claimUnlockTokenFromUrl } from "@/lib/unlock-client";

// Mounted at the root layout. On every page load, checks if the URL has
// `?unlock_session=cs_...` (Stripe success redirect) and tries to claim
// the issued unlock token. Shows a transient confirmation banner on success.
export function UnlockClaimer() {
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"success" | "warn">("success");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await claimUnlockTokenFromUrl();
      if (!result || cancelled) return;
      if (result.claimed) {
        setTone("success");
        setMessage("Payment confirmed. 10 verdicts unlocked on this device.");
      } else {
        setTone("warn");
        setMessage(result.reason);
      }
      // Auto-dismiss after 8 seconds
      setTimeout(() => setMessage(null), 8000);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={
        "fixed left-1/2 top-4 z-[60] -translate-x-1/2 transform rounded-lg border px-4 py-3 text-sm font-medium shadow-lg " +
        (tone === "success"
          ? "border-green-500/40 bg-green-950 text-green-200"
          : "border-yellow-500/40 bg-yellow-950 text-yellow-200")
      }
    >
      {message}
      <button
        type="button"
        onClick={() => setMessage(null)}
        className="ml-3 text-xs uppercase tracking-wider opacity-70 hover:opacity-100"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
