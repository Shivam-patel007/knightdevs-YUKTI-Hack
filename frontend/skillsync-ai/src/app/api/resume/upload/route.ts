import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPdf } from "@/services/resume.service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF is supported." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromPdf(buffer);

    return NextResponse.json({
      text,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to parse PDF.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
