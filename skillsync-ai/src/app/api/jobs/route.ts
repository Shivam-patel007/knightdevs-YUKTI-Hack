import { NextRequest, NextResponse } from "next/server";
import { fetchJobsFromSerpApi } from "@/lib/serp-api";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * GET /api/jobs?title=...&location=...&skills=...&page=1&limit=20
 * Uses SerpAPI Google Jobs (SERP_API_KEY in .env).
 */
export async function GET(req: NextRequest) {
  try {
    const title = req.nextUrl.searchParams.get("title") ?? undefined;
    const location = req.nextUrl.searchParams.get("location") ?? undefined;
    const skills = req.nextUrl.searchParams.get("skills") ?? undefined;
    const page = Math.max(1, Number(req.nextUrl.searchParams.get("page")) || 1);
    const limit = Math.min(
      20,
      Math.max(10, Number(req.nextUrl.searchParams.get("limit")) || 20)
    );
    const offset = (page - 1) * limit;

    const jobs = await fetchJobsFromSerpApi({
      title: title || undefined,
      location: location || undefined,
      skills: skills || undefined,
      limit,
      offset,
    });
    return NextResponse.json({
      jobs,
      page,
      limit,
      total: jobs.length,
    });
  } catch (e) {
    console.error("Jobs API error:", e);
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Failed to fetch jobs. Check SERP_API_KEY or SEARCH_API_KEY in .env.",
      },
      { status: 500 }
    );
  }
}
