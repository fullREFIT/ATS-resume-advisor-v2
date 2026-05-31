// Server-side BYOK helpers. Reads x-user-api-key header from the request,
// validates the key format (sk-ant- prefix + length), and returns it. NEVER
// logs the key value — only its presence.

const KEY_PATTERN = /^sk-ant-[A-Za-z0-9_-]{40,}$/;

export function extractByokKey(req: Request): string | null {
  const raw = req.headers.get("x-user-api-key");
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!KEY_PATTERN.test(trimmed)) return null;
  return trimmed;
}
