import Anthropic from "@anthropic-ai/sdk";

export const MODELS = {
  diagnosis: "claude-haiku-4-5",
  questions: "claude-haiku-4-5",
  output: "claude-sonnet-4-6",
  fabrication_guard: "claude-haiku-4-5",
} as const;

export type TaskKind = keyof typeof MODELS;

export interface CallClaudeOptions {
  apiKey: string;
  task: TaskKind;
  system: string;
  user: string;
  maxTokens?: number;
}

export function getClient(apiKey: string) {
  return new Anthropic({ apiKey });
}

export async function callClaude(opts: CallClaudeOptions): Promise<string> {
  const { apiKey, task, system, user, maxTokens } = opts;
  const client = getClient(apiKey);
  const max_tokens =
    maxTokens ?? (task === "output" ? 5000 : task === "questions" ? 1200 : 1200);

  const message = await client.messages.create({
    model: MODELS[task],
    max_tokens,
    system: [
      {
        type: "text",
        text: system,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: user }],
  });

  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

const FENCE = /```(?:json)?\s*([\s\S]*?)\s*```/i;

export function parseJson<T>(text: string): T | null {
  const fenced = text.match(FENCE);
  const candidate = fenced ? fenced[1] : text;
  try {
    return JSON.parse(candidate) as T;
  } catch {
    // Recover by extracting the first {...} block.
    const braceMatch = candidate.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      try {
        return JSON.parse(braceMatch[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

export class ClaudeError extends Error {
  status: number;
  upstream?: string;
  constructor(message: string, status: number, upstream?: string) {
    super(message);
    this.status = status;
    this.upstream = upstream;
  }
}

export function classifyError(err: unknown): ClaudeError {
  if (err instanceof Anthropic.APIError) {
    const status = err.status ?? 500;
    if (status === 401) {
      return new ClaudeError(
        "Invalid Anthropic API key.",
        401,
        err.message,
      );
    }
    if (status === 429) {
      return new ClaudeError(
        "Anthropic is rate limiting this request. Try again in a moment.",
        429,
        err.message,
      );
    }
    if (status >= 500) {
      return new ClaudeError(
        "Anthropic API is temporarily unavailable.",
        503,
        err.message,
      );
    }
    return new ClaudeError(`Anthropic API error.`, status, err.message);
  }
  return new ClaudeError(
    "Unexpected error calling Anthropic.",
    500,
    err instanceof Error ? err.message : String(err),
  );
}
