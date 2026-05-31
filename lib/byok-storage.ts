"use client";

// BYOK key lives in sessionStorage only — dies on tab close. Never sent to
// the app's backend except as a per-request `x-user-api-key` header that
// the server uses for the single LLM call and immediately discards.

const KEY = "rv_byok_anthropic_key";

export function loadByokKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveByokKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, key);
  } catch {
    // sessionStorage disabled or full — silently noop. User will see no-key
    // behavior in their next request.
  }
}

export function clearByokKey(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // noop
  }
}

export function isValidAnthropicKeyFormat(raw: string): boolean {
  return /^sk-ant-[A-Za-z0-9_-]{40,}$/.test(raw.trim());
}

export function byokHeaders(): Record<string, string> {
  const k = loadByokKey();
  return k ? { "x-user-api-key": k } : {};
}
