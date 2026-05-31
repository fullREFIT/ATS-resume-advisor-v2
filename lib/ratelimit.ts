import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { TaskKind } from "@/lib/claude";

type Limiter = {
  limit: (id: string) => Promise<{
    success: boolean;
    remaining: number;
    reset: number;
    limit: number;
  }>;
};

let cached: Limiter | null | undefined;

function build(): Limiter | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    if (typeof process !== "undefined" && process.env.NODE_ENV !== "test") {
      console.warn(
        "[ratelimit] No Upstash/KV credentials set — running without rate limit. Set UPSTASH_REDIS_REST_URL+TOKEN or KV_REST_API_URL+TOKEN in production.",
      );
    }
    return null;
  }
  const limit = Number(process.env.DEMO_DAILY_LIMIT ?? 5);
  const redis = new Redis({ url, token });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(limit, "1 d"),
    analytics: false,
    prefix: "ai-resume-advisor:demo",
  });
}

export function getLimiter(): Limiter | null {
  if (cached === undefined) cached = build();
  return cached;
}

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "anonymous";
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number;
  limit: number;
  enforced: boolean;
}

function isBypassToken(req: Request): boolean {
  const token = req.headers.get("x-bypass-token");
  const validToken = process.env.BYPASS_TOKEN;
  return !!(validToken && token && token === validToken);
}

export async function consumeQuota(req: Request): Promise<RateLimitResult> {
  if (isBypassToken(req)) {
    return { allowed: true, remaining: 999, reset: 0, limit: 999, enforced: false };
  }
  const limiter = getLimiter();
  if (!limiter) {
    return { allowed: true, remaining: 999, reset: 0, limit: 999, enforced: false };
  }
  const ip = getClientIp(req);
  const r = await limiter.limit(ip);
  return {
    allowed: r.success,
    remaining: r.remaining,
    reset: r.reset,
    limit: r.limit,
    enforced: true,
  };
}

// When a BYOK key is present, return a "skipped" sentinel without touching KV.
// BYOK users pay their own provider directly and should not consume the
// app's per-IP rate limit or monthly budget.
export async function consumeQuotaUnlessByok(
  req: Request,
  byokKey: string | null,
): Promise<RateLimitResult> {
  if (byokKey) {
    return { allowed: true, remaining: -1, reset: 0, limit: -1, enforced: false };
  }
  return consumeQuota(req);
}

export async function consumeBudgetUnlessByok(
  byokKey: string | null,
  estimatedCostUsd: number,
): Promise<BudgetResult> {
  if (byokKey) {
    return { allowed: true, mtdSpend: 0, budget: 0, enforced: false };
  }
  return consumeBudget(estimatedCostUsd);
}

export function rateLimitWarning(result: RateLimitResult): string | undefined {
  if (result.enforced) return undefined;
  return "Rate limit not enforced. Set UPSTASH_REDIS_REST_URL+TOKEN or KV_REST_API_URL+TOKEN in Vercel.";
}

// ---------- Budget guard ----------
//
// Tracks month-to-date LLM spend in KV and kills the free tier when over
// LLM_MONTHLY_BUDGET_USD. BYOK users and paid-unlock users skip this check
// (handled in the route handler before calling consumeBudget).

function kvClient(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function monthKey(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `ai-resume-advisor:budget:${yyyy}-${mm}`;
}

// Cost model (DeepInfra Llama 3.3 70B via OpenRouter: $0.13 input / $0.39 output per 1M).
// Assumes ~50/50 input-output ratio per call. Numbers below are deliberate over-estimates
// so the budget kill-switch trips before reality exceeds it.
export function estimateRequestCost(task: TaskKind): number {
  // Per-task average tokens (input + output) and rough USD cost
  switch (task) {
    case "output":
      // ~5000 in + ~5000 out
      return 5000 / 1e6 * 0.13 + 5000 / 1e6 * 0.39; // ~$0.00260
    case "diagnosis":
      // ~3000 in + ~1500 out
      return 3000 / 1e6 * 0.13 + 1500 / 1e6 * 0.39; // ~$0.00098
    case "questions":
      // ~2000 in + ~800 out
      return 2000 / 1e6 * 0.13 + 800 / 1e6 * 0.39;  // ~$0.00057
    case "fabrication_guard":
      // ~2000 in + ~500 out
      return 2000 / 1e6 * 0.13 + 500 / 1e6 * 0.39;  // ~$0.00046
  }
}

export interface BudgetResult {
  allowed: boolean;
  mtdSpend: number;
  budget: number;
  enforced: boolean;
}

export async function consumeBudget(estimatedCostUsd: number): Promise<BudgetResult> {
  const budget = Number(process.env.LLM_MONTHLY_BUDGET_USD ?? 40);
  const redis = kvClient();
  if (!redis) {
    return { allowed: true, mtdSpend: 0, budget, enforced: false };
  }
  const key = monthKey();
  // INCRBYFLOAT atomic-ish; Upstash REST supports it.
  const newSpend = await redis.incrbyfloat(key, estimatedCostUsd);
  // 40-day TTL so old months self-clean (idempotent — only sets on creation)
  await redis.expire(key, 60 * 60 * 24 * 40);
  const mtdSpend = typeof newSpend === "number" ? newSpend : Number(newSpend);
  return {
    allowed: mtdSpend <= budget,
    mtdSpend,
    budget,
    enforced: true,
  };
}

export async function getBudgetState(): Promise<{ mtdSpend: number; budget: number }> {
  const budget = Number(process.env.LLM_MONTHLY_BUDGET_USD ?? 40);
  const redis = kvClient();
  if (!redis) return { mtdSpend: 0, budget };
  const raw = await redis.get<string | number>(monthKey());
  const mtdSpend = raw == null ? 0 : Number(raw);
  return { mtdSpend, budget };
}

export function budgetExhaustedMessage(): string {
  return "This month's free-tier budget is exhausted. Try again next month, bring your own Anthropic API key for unlimited verdicts, or unlock 10 verdicts for $9.";
}

// ---------- Stripe unlock token consume ----------
//
// A valid unlock token (issued by /api/stripe/webhook after a $9 Checkout)
// bypasses the per-IP rate limit AND the monthly budget. Each successful
// call decrements `remaining` on the token's KV entry; once `remaining`
// reaches 0 the token stops working and the user falls back to free tier.

export interface UnlockResult {
  valid: boolean;
  remaining: number;
}

interface UnlockPayload {
  remaining: number;
  sessionId: string;
  createdAt: number;
}

export async function consumeUnlockToken(req: Request): Promise<UnlockResult> {
  const token = req.headers.get("x-unlock-token");
  if (!token || !token.startsWith("ulk_")) {
    return { valid: false, remaining: 0 };
  }
  const redis = kvClient();
  if (!redis) return { valid: false, remaining: 0 };

  const key = `ai-resume-advisor:unlock:${token}`;
  const raw = await redis.get<string | UnlockPayload>(key);
  if (raw == null) return { valid: false, remaining: 0 };

  let data: UnlockPayload;
  try {
    data = typeof raw === "string" ? (JSON.parse(raw) as UnlockPayload) : raw;
  } catch {
    return { valid: false, remaining: 0 };
  }
  if (typeof data?.remaining !== "number" || data.remaining <= 0) {
    return { valid: false, remaining: 0 };
  }

  data.remaining -= 1;
  // keepTtl preserves the 90-day window the webhook set at issuance.
  await redis.set(key, JSON.stringify(data), { keepTtl: true });
  return { valid: true, remaining: data.remaining };
}

// ---------- Generic skip helpers ----------
//
// Replace the BYOK-only skip variants when a route needs to honor multiple
// privileged paths (BYOK OR valid unlock token). Pass `skip = true` to
// bypass the consume entirely and return a no-op "allowed" result.

export async function consumeQuotaUnless(
  req: Request,
  skip: boolean,
): Promise<RateLimitResult> {
  if (skip) {
    return { allowed: true, remaining: -1, reset: 0, limit: -1, enforced: false };
  }
  return consumeQuota(req);
}

export async function consumeBudgetUnless(
  skip: boolean,
  estimatedCostUsd: number,
): Promise<BudgetResult> {
  if (skip) {
    return { allowed: true, mtdSpend: 0, budget: 0, enforced: false };
  }
  return consumeBudget(estimatedCostUsd);
}
