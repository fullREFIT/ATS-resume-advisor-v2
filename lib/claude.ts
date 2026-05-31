import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";
import OpenAI from "openai";

export type ModelProvider = "anthropic" | "groq" | "openrouter";
export type TaskKind = "diagnosis" | "questions" | "output" | "fabrication_guard";

// Flip in Vercel env. Default is "anthropic" — leaves prod on the existing
// fallback if MODEL_PROVIDER is unset.
function resolveProvider(): ModelProvider {
  const v = process.env.MODEL_PROVIDER;
  if (v === "groq") return "groq";
  if (v === "openrouter") return "openrouter";
  return "anthropic";
}

const PROVIDER: ModelProvider = resolveProvider();

// Per-provider model map. Adjust individual tasks to mix models within a
// provider (e.g. swap Groq's `output` to a larger model). Currently every
// Groq + OpenRouter task uses Llama 3.3 70B.
export const MODELS: Record<ModelProvider, Record<TaskKind, string>> = {
  anthropic: {
    diagnosis: "claude-haiku-4-5",
    questions: "claude-haiku-4-5",
    output: "claude-sonnet-4-6",
    fabrication_guard: "claude-haiku-4-5",
  },
  groq: {
    diagnosis: "llama-3.3-70b-versatile",
    questions: "llama-3.3-70b-versatile",
    output: "llama-3.3-70b-versatile",
    fabrication_guard: "llama-3.3-70b-versatile",
  },
  openrouter: {
    diagnosis: "meta-llama/llama-3.3-70b-instruct",
    questions: "meta-llama/llama-3.3-70b-instruct",
    output: "meta-llama/llama-3.3-70b-instruct",
    fabrication_guard: "meta-llama/llama-3.3-70b-instruct",
  },
};

// OpenRouter provider failover order: DeepInfra (cheapest, $0.13/$0.39) →
// Together (reliable second) → Fireworks (fast third) → Cerebras (fastest,
// capacity-constrained — last). OpenRouter auto-skips to the next on 429/5xx.
const OPENROUTER_PROVIDER_ORDER = ["DeepInfra", "Together", "Fireworks", "Cerebras"];

export interface CallClaudeOptions {
  apiKey?: string;
  task: TaskKind;
  system: string;
  user: string;
  maxTokens?: number;
  // When set, overrides the env-var-selected provider for this call. Used by
  // BYOK route handlers to force Anthropic with a user-supplied key,
  // regardless of MODEL_PROVIDER.
  providerOverride?: ModelProvider;
}

export function getActiveProvider(): ModelProvider {
  return PROVIDER;
}

export function getProviderApiKey(provider: ModelProvider = PROVIDER): string | undefined {
  switch (provider) {
    case "openrouter":
      return process.env.OPENROUTER_RESUME_VERDICT_API;
    case "groq":
      return process.env.GROQ_RESUME_VERDICT_API;
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY;
  }
}

export function isProviderConfigured(): boolean {
  return !!getProviderApiKey();
}

function providerEnvVar(provider: ModelProvider): string {
  switch (provider) {
    case "openrouter": return "OPENROUTER_RESUME_VERDICT_API";
    case "groq": return "GROQ_RESUME_VERDICT_API";
    case "anthropic": return "ANTHROPIC_API_KEY";
  }
}

export async function callClaude(opts: CallClaudeOptions): Promise<string> {
  const { task, system, user, maxTokens } = opts;
  const activeProvider = opts.providerOverride ?? PROVIDER;
  const max_tokens =
    maxTokens ?? (task === "output" ? 5000 : 1200);

  // Prefer caller-supplied key (BYOK), then the active provider's env var.
  const apiKey = opts.apiKey ?? getProviderApiKey(activeProvider) ?? "";
  if (!apiKey) {
    throw new ClaudeError(
      `No API key configured for provider "${activeProvider}". Set ${providerEnvVar(activeProvider)} in Vercel env.`,
      500,
    );
  }

  switch (activeProvider) {
    case "openrouter":
      return callOpenRouter({ apiKey, task, system, user, max_tokens });
    case "groq":
      return callGroq({ apiKey, task, system, user, max_tokens });
    case "anthropic":
      return callAnthropic({ apiKey, task, system, user, max_tokens });
  }
}

async function callAnthropic(opts: {
  apiKey: string;
  task: TaskKind;
  system: string;
  user: string;
  max_tokens: number;
}): Promise<string> {
  const client = new Anthropic({ apiKey: opts.apiKey });
  const message = await client.messages.create({
    model: MODELS.anthropic[opts.task],
    max_tokens: opts.max_tokens,
    system: [
      {
        type: "text",
        text: opts.system,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: opts.user }],
  });
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

async function callGroq(opts: {
  apiKey: string;
  task: TaskKind;
  system: string;
  user: string;
  max_tokens: number;
}): Promise<string> {
  const client = new Groq({ apiKey: opts.apiKey });
  const completion = await client.chat.completions.create({
    model: MODELS.groq[opts.task],
    max_tokens: opts.max_tokens,
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
  });
  return completion.choices[0]?.message?.content ?? "";
}

async function callOpenRouter(opts: {
  apiKey: string;
  task: TaskKind;
  system: string;
  user: string;
  max_tokens: number;
}): Promise<string> {
  const client = new OpenAI({
    apiKey: opts.apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      // OpenRouter attribution headers — improves rate limit allocation
      "HTTP-Referer": "https://ats-resume-advisor-v2.vercel.app",
      "X-Title": "Resume Verdict",
    },
  });
  // OpenRouter accepts non-standard `provider` field via extra_body for
  // failover ordering. The OpenAI SDK doesn't model it natively, so we cast.
  const completion = await client.chat.completions.create({
    model: MODELS.openrouter[opts.task],
    max_tokens: opts.max_tokens,
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
    // @ts-expect-error — OpenRouter-specific routing extension
    provider: { order: OPENROUTER_PROVIDER_ORDER, allow_fallbacks: true },
  });
  return completion.choices[0]?.message?.content ?? "";
}

const FENCE = /```(?:json)?\s*([\s\S]*?)\s*```/i;

export function parseJson<T>(text: string): T | null {
  const fenced = text.match(FENCE);
  const candidate = fenced ? fenced[1] : text;
  try {
    return JSON.parse(candidate) as T;
  } catch {
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
      return new ClaudeError("Invalid Anthropic API key.", 401, err.message);
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
    return new ClaudeError("Anthropic API error.", status, err.message);
  }

  if (err instanceof OpenAI.APIError) {
    const status = err.status ?? 500;
    const label = PROVIDER === "openrouter" ? "OpenRouter" : "OpenAI-compatible provider";
    if (status === 401) return new ClaudeError(`Invalid ${label} API key.`, 401, err.message);
    if (status === 429) return new ClaudeError(`${label} is rate limiting this request. Try again in a moment.`, 429, err.message);
    if (status >= 500) return new ClaudeError(`${label} is temporarily unavailable.`, 503, err.message);
    return new ClaudeError(`${label} API error.`, status, err.message);
  }

  if (err && typeof err === "object" && "status" in err) {
    const status = Number((err as { status: number }).status) || 500;
    const upstream = String((err as { message?: string }).message ?? "");
    if (status === 401) {
      return new ClaudeError("Invalid Groq API key.", 401, upstream);
    }
    if (status === 429) {
      return new ClaudeError(
        "Groq is rate limiting this request. Try again in a moment.",
        429,
        upstream,
      );
    }
    if (status >= 500) {
      return new ClaudeError(
        "Groq API is temporarily unavailable.",
        503,
        upstream,
      );
    }
    return new ClaudeError("Groq API error.", status, upstream);
  }

  return new ClaudeError(
    "Unexpected error calling LLM provider.",
    500,
    err instanceof Error ? err.message : String(err),
  );
}
