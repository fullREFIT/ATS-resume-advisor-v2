import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface BugReportBody {
  description?: string;
  page?: string;
  browserInfo?: string;
  viewport?: string;
}

export async function POST(req: Request) {
  let body: BugReportBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const description = (body.description ?? "").trim();
  if (description.length < 5) {
    return NextResponse.json({ error: "Description too short." }, { status: 400 });
  }

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    // No webhook configured — log and succeed silently so the user
    // doesn't see an error even in dev without Slack set up.
    console.warn("[feedback] SLACK_WEBHOOK_URL not set — bug report not forwarded:", description);
    return NextResponse.json({ ok: true });
  }

  const now = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const text = [
    `🐛 *Bug Report — Nic's AI Resume Advisor*`,
    `*Time:* ${now}`,
    `*Page:* ${body.page ?? "unknown"}`,
    `*Browser:* ${body.browserInfo ?? "unknown"} · ${body.viewport ?? "unknown"}`,
    ``,
    `*Description:*`,
    `> ${description.replace(/\n/g, "\n> ")}`,
  ].join("\n");

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (err) {
    console.error("[feedback] Slack webhook failed:", err);
    // Still return success — user reported it, that's what matters.
  }

  return NextResponse.json({ ok: true });
}
