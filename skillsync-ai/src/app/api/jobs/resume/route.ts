import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest, verifyToken } from "@/lib/auth";
import { User } from "@/models/User";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const maxDuration = 30;

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "resumes");

/**
 * POST /api/jobs/resume - upload PDF resume (multipart), store and save URL to user
 */
export async function POST(req: NextRequest) {
  const token = getAuthFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("resume") ?? formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file uploaded. Use field 'resume' or 'file'." },
        { status: 400 }
      );
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    await mkdir(UPLOAD_DIR, { recursive: true });
    const name = `${payload.userId}-${Date.now()}.pdf`;
    const filePath = path.join(UPLOAD_DIR, name);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const resumeUrl = `/uploads/resumes/${name}`;
    await connectDB();
    await User.findByIdAndUpdate(payload.userId, { resumeUrl });

    return NextResponse.json({ resumeUrl });
  } catch (e) {
    console.error("Resume upload error:", e);
    return NextResponse.json(
      { error: "Failed to upload resume" },
      { status: 500 }
    );
  }
}
