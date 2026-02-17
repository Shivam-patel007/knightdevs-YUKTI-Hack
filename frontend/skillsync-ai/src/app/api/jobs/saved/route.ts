import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest, verifyToken } from "@/lib/auth";
import { User } from "@/models/User";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = getAuthFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findById(payload.userId)
      .select("savedJobs")
      .lean();
    return NextResponse.json({
      savedJobIds: user?.savedJobs ?? [],
    });
  } catch (e) {
    console.error("Saved jobs list error:", e);
    return NextResponse.json(
      { error: "Failed to fetch saved jobs" },
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
    const jobId = body?.jobId != null ? String(body.jobId) : null;
    if (!jobId) {
      return NextResponse.json(
        { error: "jobId is required" },
        { status: 400 }
      );
    }

    await connectDB();
    await User.findByIdAndUpdate(payload.userId, {
      $addToSet: { savedJobs: jobId },
    });
    return NextResponse.json({ saved: true });
  } catch (e) {
    console.error("Save job error:", e);
    return NextResponse.json(
      { error: "Failed to save job" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const token = getAuthFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const jobId = req.nextUrl.searchParams.get("jobId");
    if (!jobId) {
      return NextResponse.json(
        { error: "jobId query is required" },
        { status: 400 }
      );
    }

    await connectDB();
    await User.findByIdAndUpdate(payload.userId, {
      $pull: { savedJobs: jobId },
    });
    return NextResponse.json({ removed: true });
  } catch (e) {
    console.error("Unsave job error:", e);
    return NextResponse.json(
      { error: "Failed to remove saved job" },
      { status: 500 }
    );
  }
}
