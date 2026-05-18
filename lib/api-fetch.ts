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
  const data = (await res.json()) as TResp & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `Request to /${endpoint} failed.`);
  }
  return data;
}
