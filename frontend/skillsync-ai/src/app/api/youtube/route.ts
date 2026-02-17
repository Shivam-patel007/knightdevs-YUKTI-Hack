import { NextRequest, NextResponse } from "next/server";
import { getYouTubeResourcesForSkills } from "@/services/youtube.service";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { skills } = body as { skills?: string[] };

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json(
        { error: "skills must be a non-empty array" },
        { status: 400 }
      );
    }

    const results = await getYouTubeResourcesForSkills(skills);

    return NextResponse.json({ resources: results });
  } catch (error) {
    console.error("/api/youtube error:", error);
    return NextResponse.json(
      { error: "Failed to fetch YouTube resources." },
      { status: 500 }
    );
  }
}
