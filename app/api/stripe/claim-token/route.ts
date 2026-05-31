import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function kvClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function POST(req: Request) {
  const redis = kvClient();
  if (!redis) {
    return NextResponse.json({ error: "KV not configured." }, { status: 500 });
  }

  let body: { sessionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const sessionId = body.sessionId;
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Missing or invalid sessionId." }, { status: 400 });
  }

  const token = await redis.get<string>(`ai-resume-advisor:unlock-session:${sessionId}`);
  if (!token) {
    return NextResponse.json(
      {
        error:
          "No token for this session yet — the payment webhook may not have fired. Wait 30 seconds and try again.",
      },
      { status: 404 },
    );
  }
  // One-time claim: delete the session→token mapping after handing the token over.
  await redis.del(`ai-resume-advisor:unlock-session:${sessionId}`);
  return NextResponse.json({ token });
}
