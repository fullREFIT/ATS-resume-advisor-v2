"use client";

type DemoEndpoint =
  | "diagnose"
  | "questions"
  | "output"
  | "company-diagnose"
  | "company-questions"
  | "company-output";

type RootEndpoint = "fetch-company";

type Endpoint = DemoEndpoint | RootEndpoint;

const ROOT_ENDPOINTS = new Set<RootEndpoint>(["fetch-company"]);

export interface CallApiArgs<TBody> {
  endpoint: Endpoint;
  body: TBody;
}

function urlFor(endpoint: Endpoint): string {
  if (ROOT_ENDPOINTS.has(endpoint as RootEndpoint)) {
    return `/api/${endpoint}`;
  }
  return `/api/demo/${endpoint}`;
}

function getBypassToken(): string | null {
  try {
    return localStorage.getItem("nars_bypass_token");
  } catch {
    return null;
  }
}

export async function callApi<TBody, TResp>({
  endpoint,
  body,
}: CallApiArgs<TBody>): Promise<TResp> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const bypass = getBypassToken();
  if (bypass) headers["x-bypass-token"] = bypass;

  const res = await fetch(urlFor(endpoint), {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const rawText = await res.text();

  if (!isJson) {
    if (
      res.status === 504 ||
      /FUNCTION_INVOCATION_TIMEOUT|timed? ?out/i.test(rawText)
    ) {
      throw new Error(
        "The model took too long to respond (over 60 seconds). This usually happens with very long intake answers. Try shortening your longest answer, or press Generate again — the second attempt often succeeds.",
      );
    }
    if (res.status === 413) {
      throw new Error(
        "Your inputs are too large to process. Shorten your resume or intake answers and try again.",
      );
    }
    if (res.status >= 500) {
      throw new Error(
        `The server returned an unexpected error (HTTP ${res.status}). Wait 30 seconds and try Generate again.`,
      );
    }
    throw new Error(
      `Unexpected response from /${endpoint} (HTTP ${res.status}). Try again in a moment.`,
    );
  }

  let data: (TResp & { error?: string }) | null = null;
  try {
    data = rawText
      ? (JSON.parse(rawText) as TResp & { error?: string })
      : null;
  } catch {
    throw new Error(
      "The server returned an invalid response. Press Generate again — this is usually transient.",
    );
  }
  if (!data) {
    throw new Error(`Empty response from /${endpoint}. Try again.`);
  }
  if (!res.ok) {
    throw new Error(data.error ?? `Request to /${endpoint} failed.`);
  }
  return data;
}
