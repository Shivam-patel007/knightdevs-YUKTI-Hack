import { NextRequest, NextResponse } from "next/server";
import {
  analyzeResumeWithJobDescription,
  enrichRoadmapWithYouTube,
} from "@/services/resume-analyzer.service";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * POST /api/analyze-resume
 * Body: { resumeText: string, jobDescription: string }
 * Returns: { matched_skills, missing_skills, skill_gap_percentage, roadmap } (roadmap includes youtube_resources)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeText, jobDescription } = body as {
      resumeText?: string;
      jobDescription?: string;
    };

    if (!resumeText?.trim()) {
      return NextResponse.json(
        { error: "Missing resume text" },
        { status: 400 }
      );
    }
    if (!jobDescription?.trim()) {
      return NextResponse.json(
        { error: "Missing job description" },
        { status: 400 }
      );
    }

    const result = await analyzeResumeWithJobDescription(
      resumeText.trim(),
      jobDescription.trim()
    );

    try {
      result.roadmap = await enrichRoadmapWithYouTube(result.roadmap);
    } catch (ytErr) {
      console.warn("YouTube enrichment failed, returning without videos:", ytErr);
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Analysis failed. Please try again.";
    console.error("/api/analyze-resume error", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
