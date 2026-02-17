import { NextRequest, NextResponse } from "next/server";
import { searchYouTubeForSkill } from "@/services/youtube.service";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * GET /api/youtube/search?q=React
 * Returns YouTube videos for the given skill query (thumbnails, titles, links).
 */
export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q")?.trim();
    if (!q) {
      return NextResponse.json(
        { error: "Missing search query. Use ?q=skill" },
        { status: 400 }
      );
    }

    const maxResults = Math.min(
      Number(req.nextUrl.searchParams.get("max") ?? 12) || 12,
      20
    );
    const videos = await searchYouTubeForSkill(q, maxResults);

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("/api/youtube/search error:", error);
    return NextResponse.json(
      { error: "Failed to fetch YouTube videos." },
      { status: 500 }
    );
  }
}
