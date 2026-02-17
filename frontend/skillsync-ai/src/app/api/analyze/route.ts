import { NextRequest, NextResponse } from "next/server";
import { extractSkills, generateRoadmap } from "@/services/ai.service";
import { computeSkillGap, getAllUserSkills } from "@/services/skill-gap.service";
import { computeAtsScore } from "@/services/ats.service";
import { getRoleByName, ROLE_DEFINITIONS } from "@/data/roles";
import { getIndustryDemand } from "@/utils/ats";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET() {
  return NextResponse.json({
    roles: ROLE_DEFINITIONS.map((r) => r.roleName),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, resumeText, selectedRole } = body as {
      email?: string;
      resumeText: string;
      selectedRole: string;
    };

    if (!resumeText || !selectedRole) {
      return NextResponse.json(
        { error: "Missing resume text or selected role" },
        { status: 400 }
      );
    }

    const role = getRoleByName(selectedRole);
    if (!role) {
      return NextResponse.json(
        { error: "Invalid role selected" },
        { status: 400 }
      );
    }

    // 1. AI skill extraction (structured)
    const extracted = await extractSkills(resumeText);
    const allUserSkills = getAllUserSkills(extracted);

    // 2. Skill gap
    const gap = computeSkillGap(allUserSkills, role.requiredSkills);

    // 3. ATS score
    const ats = computeAtsScore(resumeText, allUserSkills, role);

    // 4. Industry demand
    const demand = getIndustryDemand(selectedRole);

    // 5. Roadmap
    const roadmap = await generateRoadmap(
      selectedRole,
      gap.missing_skills,
      allUserSkills
    );

    // Optional: persist to DB if Prisma + auth configured
    // await saveAnalysisToDb(...)

    return NextResponse.json({
      userId: email ? `email:${email}` : undefined,
      skills: allUserSkills,
      extracted: {
        technical_skills: extracted.technical_skills,
        soft_skills: extracted.soft_skills,
        tools: extracted.tools,
        experience_level: extracted.experience_level,
      },
      comparison: {
        matchedSkills: gap.matched_skills,
        missingSkills: gap.missing_skills,
        matchScore: gap.skill_match_percentage,
      },
      roadmap,
      ats: { score: ats.score, notes: ats.notes },
      demand,
    });
  } catch (error: any) {
    console.error("/api/analyze error", error);
    return NextResponse.json(
      { error: error?.message || "Failed to analyze resume. Please try again." },
      { status: 500 }
    );
  }
}
