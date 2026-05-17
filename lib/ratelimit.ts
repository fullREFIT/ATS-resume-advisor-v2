import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

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
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (typeof process !== "undefined" && process.env.NODE_ENV !== "test") {
      console.warn(
        "[ratelimit] UPSTASH_REDIS_REST_URL / _TOKEN not set — running without rate limit. Set these in production.",
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
}

export async function consumeQuota(req: Request): Promise<RateLimitResult> {
  const limiter = getLimiter();
  if (!limiter) {
    return { allowed: true, remaining: 999, reset: 0, limit: 999 };
  }
  const ip = getClientIp(req);
  const r = await limiter.limit(ip);
  return {
    allowed: r.success,
    remaining: r.remaining,
    reset: r.reset,
    limit: r.limit,
  };
}
