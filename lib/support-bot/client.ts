// support-bot-client.ts
//
// Server-only dual-write to the fullREFIT Support Bot service.
//
// Copy this file into each calling app and import { submitToSupportBot }.
// Call AFTER the local insert succeeds, and DO NOT await — Support Bot
// failures must never block local-write success or the user's response.
//
// Required env (server-side; never expose to the browser):
//   SUPPORT_BOT_URL       — e.g. https://support-bot.fullrefit.com
//   SUPPORT_BOT_API_KEY   — the app's own sb_live_… key (minted via
//                           support-bot/scripts/register-app.ts)
//   SUPPORT_BOT_APP_ID    — the app's registered id, e.g. "thecontractorswife.app"

export interface SubmitToSupportBotInput {
  /** Free-form bug description / test feedback. Required. 8KB max server-side. */
  transcript: string;
  /** App route the user was on (e.g. "/voice"). */
  route?: string;
  /** Reporter's email if known. */
  user_email?: string;
  /** Browser UA string. */
  user_agent?: string;
  /** "1280×800" — server expects a string, not split values. */
  viewport?: string;
  /** Anything the app wants to forward (test_id, step_id, mode, …). */
  context?: Record<string, unknown>;
  /** Defaults to "bug". Use "test_feedback" for in-app test flows. */
  kind?: "bug" | "test_feedback";
  /** The local DB row's id, so Support Bot can link back to the source row. */
  source_report_id?: string;
}

export type SubmitToSupportBotResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

const TIMEOUT_MS = 5_000;

export async function submitToSupportBot(
  input: SubmitToSupportBotInput,
): Promise<SubmitToSupportBotResult> {
  const url = process.env.SUPPORT_BOT_URL;
  const key = process.env.SUPPORT_BOT_API_KEY;
  const appId = process.env.SUPPORT_BOT_APP_ID;
  if (!url || !key || !appId) {
    return { ok: false, error: "support_bot_env_missing" };
  }
  try {
    const res = await fetch(`${url}/api/v1/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ app_id: appId, ...input }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return (await res.json()) as SubmitToSupportBotResult;
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
