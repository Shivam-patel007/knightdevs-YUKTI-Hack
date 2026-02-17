import { callOpenRouter } from "@/lib/openrouter";
import type { ResumeAnalyzerResponse, RoadmapItem } from "@/types/resume-analyzer";
import { fetchYouTubeForSkill } from "./youtube-resources";

const ANALYSIS_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

/**
 * Ask OpenRouter to analyze resume vs job description and return strict JSON.
 */
export async function analyzeResumeWithJobDescription(
  resumeText: string,
  jobDescription: string
): Promise<ResumeAnalyzerResponse> {
  const prompt = `You are a resume analyst. Compare the candidate's resume with the job description and return ONLY valid JSON with no markdown, no explanation, no code block.

RESUME:
"""
${resumeText.slice(0, 14000)}
"""

JOB DESCRIPTION:
"""
${jobDescription.slice(0, 4000)}
"""

Return exactly this JSON structure and nothing else:
{
  "matched_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2"],
  "skill_gap_percentage": "75",
  "roadmap": [
    {
      "skill": "Skill Name",
      "beginner_steps": ["step1", "step2"],
      "intermediate_steps": ["step1", "step2"],
      "advanced_steps": ["step1", "step2"]
    }
  ]
}

Rules:
- matched_skills: skills from the job that appear in the resume
- missing_skills: skills from the job that are missing in the resume
- skill_gap_percentage: number as string 0-100 (how well resume matches job)
- roadmap: one object per missing_skill with learning steps (beginner, intermediate, advanced)
- Return only the JSON object.`;

  const content = await callOpenRouter(
    [
      {
        role: "system",
        content:
          "You output only valid JSON. No markdown, no explanation, no code fence. Never add text before or after the JSON.",
      },
      { role: "user", content: prompt },
    ],
    { model: ANALYSIS_MODEL, temperature: 0.2 }
  );

  const raw = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/g, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        throw new Error("AI returned invalid JSON. Please try again.");
      }
    } else {
      throw new Error("AI returned invalid JSON. Please try again.");
    }
  }

  const obj = (parsed && typeof parsed === "object" ? parsed : {}) as Record<string, unknown>;
  const roadmap = Array.isArray(obj.roadmap)
    ? (obj.roadmap as RoadmapItem[]).map((r) => ({
        skill: String(r?.skill ?? ""),
        beginner_steps: Array.isArray(r?.beginner_steps) ? r.beginner_steps : [],
        intermediate_steps: Array.isArray(r?.intermediate_steps) ? r.intermediate_steps : [],
        advanced_steps: Array.isArray(r?.advanced_steps) ? r.advanced_steps : [],
      }))
    : [];
  const missing_skills = Array.isArray(obj.missing_skills)
    ? (obj.missing_skills as string[]).filter((s) => typeof s === "string")
    : [];
  const matched_skills = Array.isArray(obj.matched_skills)
    ? (obj.matched_skills as string[]).filter((s) => typeof s === "string")
    : [];
  const skill_gap_percentage =
    typeof obj.skill_gap_percentage === "string"
      ? obj.skill_gap_percentage
      : typeof obj.skill_gap_percentage === "number"
        ? String(Math.round(obj.skill_gap_percentage))
        : "0";

  return {
    matched_skills,
    missing_skills,
    skill_gap_percentage,
    roadmap,
  };
}

/**
 * Enrich each roadmap item with YouTube resources (Learn {skill} full course).
 */
export async function enrichRoadmapWithYouTube(
  roadmap: RoadmapItem[]
): Promise<RoadmapItem[]> {
  return Promise.all(
    roadmap.map(async (item) => {
      const youtube_resources = await fetchYouTubeForSkill(item.skill, 3);
      return {
        ...item,
        youtube_resources,
      };
    })
  );
}
