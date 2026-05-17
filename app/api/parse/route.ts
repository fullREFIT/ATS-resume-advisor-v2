import { NextResponse } from "next/server";
import { parseResumeBuffer } from "@/lib/parse-resume";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data with a file field." },
      { status: 400 },
    );
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "No file uploaded." },
      { status: 400 },
    );
  }
  try {
    const ab = await file.arrayBuffer();
    const buffer = Buffer.from(ab);
    const result = await parseResumeBuffer(file.name, buffer);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to parse this file. Paste plain text instead.",
      },
      { status: 400 },
    );
  }
}
