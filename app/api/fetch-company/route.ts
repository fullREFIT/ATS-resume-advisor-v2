import { NextResponse } from "next/server";
import { fetchCompany } from "@/lib/fetch-company";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

export async function POST(req: Request) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const url = (body.url ?? "").trim();
  if (!url) {
    return NextResponse.json({ error: "URL is required." }, { status: 400 });
  }
  try {
    const result = await fetchCompany(url);
    return NextResponse.json({ company: result });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to read that website.",
      },
      { status: 400 },
    );
  }
}
