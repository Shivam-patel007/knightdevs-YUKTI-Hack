import { NextRequest, NextResponse } from "next/server";
import { decodeJobId } from "@/lib/google-custom-search";

export const runtime = "nodejs";

/**
 * GET /api/jobs/[id] - single job by id.
 * For Custom Search results, id is a base64-encoded payload; we decode and return.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }

    const job = decodeJobId(id);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    return NextResponse.json(job);
  } catch (e) {
    console.error("Job by id error:", e);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}
