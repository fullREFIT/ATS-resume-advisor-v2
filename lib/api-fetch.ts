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

export async function callApi<TBody, TResp>({
  endpoint,
  body,
}: CallApiArgs<TBody>): Promise<TResp> {
  const res = await fetch(urlFor(endpoint), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as TResp & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `Request to /${endpoint} failed.`);
  }
  return data;
}
