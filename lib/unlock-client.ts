"use client";

// Stripe Checkout unlock token persistence + claim-from-URL helper.
//
// Tokens live in localStorage (not sessionStorage) so they survive tab
// closes — users paid for 10 verdicts across whatever sessions they want.

const KEY = "rv_unlock_token";

export function getUnlockToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setUnlockToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, token);
  } catch {
    // noop
  }
}

export function clearUnlockToken(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // noop
  }
}

export function unlockHeaders(): Record<string, string> {
  const t = getUnlockToken();
  return t ? { "x-unlock-token": t } : {};
}

// Called on landing page mount. If the user just came back from a Stripe
// Checkout success redirect, the URL has `?unlock_session=cs_test_...`.
// We POST the session id to /api/stripe/claim-token, which returns the
// unlock token issued by the webhook. We then store it and clear the query
// param so a page refresh doesn't re-attempt the claim.
//
// Handles webhook-redirect race: retries twice with backoff if the webhook
// hasn't fired by the time the user lands.
export async function claimUnlockTokenFromUrl(): Promise<
  { claimed: true; token: string } | { claimed: false; reason: string } | null
> {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("unlock_session");
  if (!sessionId) return null;

  const cleanUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("unlock_session");
    url.searchParams.delete("unlock_cancelled");
    window.history.replaceState({}, "", url.toString());
  };

  const tryClaim = async (): Promise<Response> =>
    fetch("/api/stripe/claim-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });

  // Attempt 1
  try {
    let r = await tryClaim();
    if (r.ok) {
      const { token } = (await r.json()) as { token: string };
      setUnlockToken(token);
      cleanUrl();
      return { claimed: true, token };
    }
    // Attempt 2 — webhook lag tolerance (Stripe usually fires within 1-2s
    // but cold KV writes can lag).
    if (r.status === 404) {
      await new Promise((res) => setTimeout(res, 2500));
      r = await tryClaim();
      if (r.ok) {
        const { token } = (await r.json()) as { token: string };
        setUnlockToken(token);
        cleanUrl();
        return { claimed: true, token };
      }
    }
    // Attempt 3 — final retry, longer wait
    if (r.status === 404) {
      await new Promise((res) => setTimeout(res, 5000));
      r = await tryClaim();
      if (r.ok) {
        const { token } = (await r.json()) as { token: string };
        setUnlockToken(token);
        cleanUrl();
        return { claimed: true, token };
      }
    }
    cleanUrl();
    return {
      claimed: false,
      reason:
        "Payment recorded, but the unlock token wasn't issued in time. Refresh the page in 30 seconds — if it still doesn't appear, the Stripe webhook may need attention.",
    };
  } catch {
    cleanUrl();
    return { claimed: false, reason: "Network error while claiming unlock token." };
  }
}
