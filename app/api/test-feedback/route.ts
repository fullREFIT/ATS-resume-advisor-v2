import { NextResponse } from "next/server";
import { submitToSupportBot } from "@/lib/support-bot/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TestFeedbackBody {
  testId?: string;
  stepId?: string;
  stepTitle?: string;
  transcript?: string;
  mode?: "voice" | "text";
}

export async function POST(req: Request) {
  let body: TestFeedbackBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const transcript = (body.transcript ?? "").trim();
  if (transcript.length < 3) {
    return NextResponse.json({ error: "Transcript too short." }, { status: 400 });
  }
  if (transcript.length > 4000) {
    return NextResponse.json({ error: "Transcript too long." }, { status: 400 });
  }

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("[test-feedback] SLACK_WEBHOOK_URL not set — feedback not forwarded:", transcript);
  } else {
    const now = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      dateStyle: "medium",
      timeStyle: "short",
    });

    const text = [
      `🧪 *TEST FEEDBACK — ${body.testId ?? "rv-test-1"}*`,
      `*Step:* ${body.stepTitle ?? "unknown"}  _(${body.stepId ?? "?"})_`,
      `*Mode:* ${body.mode ?? "text"}  ·  *Time:* ${now}`,
      ``,
      `> ${transcript.replace(/\n/g, "\n> ")}`,
    ].join("\n");

    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
    } catch (err) {
      console.error("[test-feedback] Slack webhook failed:", err);
    }
  }

  // Fire-and-forget dual-write to the cross-app support bot.
  void submitToSupportBot({
    transcript,
    route: `/${body.testId ?? "rv-test-1"}`,
    context: {
      test_id: body.testId,
      step_id: body.stepId,
      step_title: body.stepTitle,
      mode: body.mode ?? "text",
    },
    kind: "test_feedback",
  });

  return NextResponse.json({ ok: true });
}
