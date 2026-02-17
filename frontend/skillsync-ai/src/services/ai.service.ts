import { callOpenRouter } from "@/lib/openrouter";
import {
  ExtractedSkillsSchema,
  type ExtractedSkills,
  RoadmapResponseSchema,
  type RoadmapResponse,
} from "@/types/schemas";

/**
 * Extract structured skills from resume text using OpenRouter/LLM
 */
export async function extractSkills(resumeText: string): Promise<ExtractedSkills> {
  const prompt = `Extract structured skills from this resume. Return ONLY valid JSON in this exact format:
{
  "technical_skills": ["skill1", "skill2"],
  "soft_skills": ["skill1", "skill2"],
  "tools": ["tool1", "tool2"],
  "experience_level": "Junior" | "Mid" | "Senior" | "Lead" | "Unknown"
}

Resume:
"""
${resumeText.slice(0, 12000)}
"""`;

  const content = await callOpenRouter(
    [
      {
        role: "system",
        content: "You extract structured skill information from resumes. Respond only with valid JSON.",
      },
      { role: "user", content: prompt },
    ],
    { temperature: 0.1, responseFormat: { type: "json_object" } }
  );

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("AI returned invalid JSON. Please try again.");
  }
  const result = ExtractedSkillsSchema.safeParse(parsed);
  if (!result.success) {
    // Fallback: treat as flat skills array if schema mismatch
    if (typeof parsed === "object" && parsed !== null && "skills" in parsed) {
      const legacy = parsed as { skills?: string[] };
      const skills = Array.isArray(legacy.skills) ? legacy.skills : [];
      return {
        technical_skills: skills,
        soft_skills: [],
        tools: [],
        experience_level: "Unknown",
      };
    }
    throw new Error("AI response format unexpected. Please try again.");
  }
  return result.data;
}

/**
 * Generate 6-month learning roadmap
 */
export async function generateRoadmap(
  targetRole: string,
  missingSkills: string[],
  currentSkills?: string[]
): Promise<RoadmapResponse> {
  const prompt = `Generate a 6-month learning roadmap in JSON format.
Target role: ${targetRole}
Missing skills: ${missingSkills.join(", ")}
${currentSkills?.length ? `Current skills: ${currentSkills.slice(0, 15).join(", ")}` : ""}

Return ONLY valid JSON:
{
  "months": [
    {
      "month": 1,
      "focusSkills": ["skill1", "skill2"],
      "recommendedProjects": ["project1"],
      "weeklyGoals": "string",
      "estimatedHoursPerWeek": 8
    }
  ]
}

Each month must have: focusSkills, recommendedProjects, weeklyGoals, estimatedHoursPerWeek.`;

  const content = await callOpenRouter(
    [
      {
        role: "system",
        content: "You design realistic learning roadmaps. Respond only with valid JSON.",
      },
      { role: "user", content: prompt },
    ],
    { temperature: 0.3, responseFormat: { type: "json_object" } }
  );

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("AI returned invalid roadmap JSON. Please try again.");
  }
  const result = RoadmapResponseSchema.safeParse(parsed);
  if (!result.success) {
    const obj = parsed as { months?: unknown[] };
    const months = Array.isArray(obj?.months)
      ? obj.months.slice(0, 6).map((m, i) => ({
          month: (m as { month?: number })?.month ?? i + 1,
          focusSkills: Array.isArray((m as { focusSkills?: unknown })?.focusSkills)
            ? (m as { focusSkills: string[] }).focusSkills
            : [],
          recommendedProjects: Array.isArray((m as { recommendedProjects?: unknown })?.recommendedProjects)
            ? (m as { recommendedProjects: string[] }).recommendedProjects
            : [],
          weeklyGoals: typeof (m as { weeklyGoals?: string })?.weeklyGoals === "string"
            ? (m as { weeklyGoals: string }).weeklyGoals
            : "",
          estimatedHoursPerWeek: typeof (m as { estimatedHoursPerWeek?: number })?.estimatedHoursPerWeek === "number"
            ? (m as { estimatedHoursPerWeek: number }).estimatedHoursPerWeek
            : 8,
        }))
      : Array.from({ length: 6 }, (_, i) => ({
          month: i + 1,
          focusSkills: missingSkills.slice(i * 2, (i + 1) * 2),
          recommendedProjects: [],
          weeklyGoals: "Focus on skill building",
          estimatedHoursPerWeek: 8,
        }));
    return { months };
  }
  return result.data;
}
