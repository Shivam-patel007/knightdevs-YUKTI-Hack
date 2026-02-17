import { NextRequest, NextResponse } from "next/server";
import { generateRoadmap } from "@/services/ai.service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetRole, missingSkills, currentSkills } = body as {
      targetRole?: string;
      missingSkills?: string[];
      currentSkills?: string[];
    };

    if (!targetRole || !missingSkills || !Array.isArray(missingSkills)) {
      return NextResponse.json(
        { error: "targetRole and missingSkills are required" },
        { status: 400 }
      );
    }

    const roadmap = await generateRoadmap(
      targetRole,
      missingSkills,
      Array.isArray(currentSkills) ? currentSkills : undefined
    );

    return NextResponse.json(roadmap);
  } catch (error) {
    console.error("/api/roadmap error:", error);
    return NextResponse.json(
      { error: "Failed to generate roadmap." },
      { status: 500 }
    );
  }
}
