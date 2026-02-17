import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest, verifyToken } from "@/lib/auth";
import { Application } from "@/models/Application";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = getAuthFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const list = await Application.find({ userId: payload.userId })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ applications: list });
  } catch (e) {
    console.error("Applications list error:", e);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const token = getAuthFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { jobId, jobSnapshot, resumeUrl } = body as {
      jobId?: string;
      jobSnapshot?: Record<string, unknown>;
      resumeUrl?: string;
    };
    if (!jobId) {
      return NextResponse.json(
        { error: "jobId is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const existing = await Application.findOne({
      userId: payload.userId,
      jobId: String(jobId),
    });
    if (existing) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 409 }
      );
    }

    const app = await Application.create({
      userId: payload.userId,
      jobId: String(jobId),
      jobSnapshot: jobSnapshot ?? null,
      resumeUrl: resumeUrl ?? undefined,
      status: "applied",
    });
    return NextResponse.json({ application: app });
  } catch (e) {
    console.error("Apply error:", e);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
