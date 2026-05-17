"use client";

type Endpoint = "diagnose" | "questions" | "output";

export interface CallApiArgs<TBody> {
  endpoint: Endpoint;
  body: TBody;
}

export async function callApi<TBody, TResp>({
  endpoint,
  body,
}: CallApiArgs<TBody>): Promise<TResp> {
  const res = await fetch(`/api/demo/${endpoint}`, {
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
