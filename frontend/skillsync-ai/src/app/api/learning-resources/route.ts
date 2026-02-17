import { NextRequest, NextResponse } from "next/server";
import { getYouTubeResourcesForSkills } from "@/services/youtube.service";
import { generateLearningResources } from "@/lib/learning";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { missingSkills } = body as { missingSkills: string[] };

    if (!missingSkills || !Array.isArray(missingSkills)) {
      return NextResponse.json(
        { error: "missingSkills must be an array of strings" },
        { status: 400 }
      );
    }

    // Prefer YouTube Data API when key is configured
    if (process.env.YOUTUBE_API_KEY) {
      const ytResults = await getYouTubeResourcesForSkills(missingSkills);
      const resources = ytResults.map(({ skill, videos }) => ({
        skill,
        youtube: videos.map((v) => ({ title: v.title, url: v.url, channel: v.channel })),
        courses: [],
        projectSuggestion: `Build a small project using ${skill} to solidify your learning.`,
        estimatedLearningTimeWeeks: 2,
      }));
      return NextResponse.json({ resources });
    }

    // Fallback: AI-generated resources
    const resources = await generateLearningResources(missingSkills);
    return NextResponse.json(resources);
  } catch (error) {
    console.error("/api/learning-resources error", error);
    return NextResponse.json(
      { error: "Failed to generate learning resources. Please try again." },
      { status: 500 }
    );
  }
}
