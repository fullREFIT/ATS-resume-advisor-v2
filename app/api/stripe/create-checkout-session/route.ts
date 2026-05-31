import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRICE_USD = 9;
const VERDICTS_PER_UNLOCK = 10;

export async function POST(req: Request) {
  const secret = process.env.STRIPE_RESUME_VERDICT_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Stripe not configured. Try again later or use BYOK." },
      { status: 500 },
    );
  }

  const stripe = new Stripe(secret);
  const origin = req.headers.get("origin") ?? "https://ats-resume-advisor-v2.vercel.app";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Resume Verdict — ${VERDICTS_PER_UNLOCK} Verdict Unlock`,
              description: `Unlocks ${VERDICTS_PER_UNLOCK} full verdicts (output, cover letter, gap closer, recruiter scan, etc.) on this device. Non-refundable digital service.`,
            },
            unit_amount: PRICE_USD * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/?unlock_session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?unlock_cancelled=1`,
      allow_promotion_codes: true,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Could not start checkout: ${msg}` },
      { status: 500 },
    );
  }
}
