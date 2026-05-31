import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VERDICTS_PER_UNLOCK = 10;

function kvClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function randomToken(): string {
  // crypto.randomUUID is available in Node 19+ and Vercel runtime.
  return "ulk_" + crypto.randomUUID().replace(/-/g, "");
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_RESUME_VERDICT_SECRET;
  const whSecret = process.env.STRIPE_RESUME_VERDICT_WEBHOOK_SECRET;
  if (!secret || !whSecret) {
    return NextResponse.json({ error: "Stripe not configured." }, { status: 500 });
  }
  const redis = kvClient();
  if (!redis) {
    return NextResponse.json({ error: "KV not configured." }, { status: 500 });
  }

  const stripe = new Stripe(secret);
  const sig = req.headers.get("stripe-signature") ?? "";
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, whSecret);
  } catch {
    // Don't echo verification details to the caller.
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const token = randomToken();
    const tokenPayload = {
      remaining: VERDICTS_PER_UNLOCK,
      sessionId: session.id,
      createdAt: Date.now(),
    };
    // 90-day token TTL.
    await redis.set(
      `ai-resume-advisor:unlock:${token}`,
      JSON.stringify(tokenPayload),
      { ex: 60 * 60 * 24 * 90 },
    );
    // 7-day claim window — frontend looks this up by session id after the
    // Stripe success redirect, then we delete it on claim.
    await redis.set(
      `ai-resume-advisor:unlock-session:${session.id}`,
      token,
      { ex: 60 * 60 * 24 * 7 },
    );
  }

  return NextResponse.json({ received: true });
}
