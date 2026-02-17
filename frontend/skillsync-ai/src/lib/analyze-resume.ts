/**
 * Resume analysis: match/missing skills, skill gap %, and per-skill roadmaps.
 * Uses OpenAI or OpenRouter; returns structured JSON only.
 */

export type RoadmapStage = {
  level: "Beginner" | "Intermediate" | "Advanced";
  topics: string[];
  projects: string[];
  duration: string;
};

export type SkillRoadmap = {
  stages: RoadmapStage[];
  youtubeQueries: string[];
};

export type AnalyzeResumeResponse = {
  matchingSkills: string[];
  missingSkills: string[];
  skillGapPercentage: number;
  roadmap: Record<string, SkillRoadmap>;
};

const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

function buildSystemPrompt(requiredSkillsJson: string): string {
  return `You are a career analyst. You analyze resumes against a target job role and return ONLY valid JSON—no markdown, no code fences, no explanation.

Given resume text and the list of required skills for the job, you must:
1. Identify which required skills the candidate clearly has (matchingSkills).
2. Identify which required skills are missing or weak (missingSkills).
3. Compute skillGapPercentage: round(100 * (missingSkills.length / totalRequiredSkills)).
4. For each skill in missingSkills, generate a roadmap with:
   - stages: array of exactly 3 objects with level "Beginner", "Intermediate", "Advanced". Each has: topics (string[]), projects (string[]), duration (string, e.g. "2-3 weeks").
   - youtubeQueries: 3-5 search query strings to find YouTube tutorials for this skill (e.g. "React hooks tutorial for beginners").

Required skills for the job (use these exact names in matchingSkills/missingSkills):
${requiredSkillsJson}

Respond with a single JSON object in this exact shape:
{
  "matchingSkills": ["Skill1", "Skill2"],
  "missingSkills": ["SkillA", "SkillB"],
  "skillGapPercentage": number,
  "roadmap": {
    "SkillA": {
      "stages": [
        { "level": "Beginner", "topics": [], "projects": [], "duration": "" },
        { "level": "Intermediate", "topics": [], "projects": [], "duration": "" },
        { "level": "Advanced", "topics": [], "projects": [], "duration": "" }
      ],
      "youtubeQueries": []
    }
  }
}`;
}

function buildUserPrompt(resumeText: string, jobRole: string): string {
  return `Job role: ${jobRole}

Resume text:
"""
${resumeText.slice(0, 12000)}
"""

Return only the JSON object, no other text.`;
}

function parseAndValidate(raw: string, missingSkills: string[]): AnalyzeResumeResponse {
  const parsed = JSON.parse(raw) as AnalyzeResumeResponse;
  const matchingSkills = Array.isArray(parsed.matchingSkills)
    ? parsed.matchingSkills.filter((s) => typeof s === "string")
    : [];
  const missing = Array.isArray(parsed.missingSkills)
    ? parsed.missingSkills.filter((s) => typeof s === "string")
    : [];
  const skillGapPercentage =
    typeof parsed.skillGapPercentage === "number"
      ? Math.round(parsed.skillGapPercentage)
      : missing.length && missingSkills.length
        ? Math.round(100 * (missing.length / missingSkills.length))
        : 0;
  const roadmap: Record<string, SkillRoadmap> = {};

  if (parsed.roadmap && typeof parsed.roadmap === "object") {
    for (const skill of missing) {
      const r = parsed.roadmap[skill];
      if (r && Array.isArray(r.stages)) {
        roadmap[skill] = {
          stages: r.stages.slice(0, 3).map((s: RoadmapStage) => ({
            level:
              s.level === "Beginner" || s.level === "Intermediate" || s.level === "Advanced"
                ? s.level
                : "Beginner",
            topics: Array.isArray(s.topics) ? s.topics : [],
            projects: Array.isArray(s.projects) ? s.projects : [],
            duration: typeof s.duration === "string" ? s.duration : "",
          })),
          youtubeQueries: Array.isArray(r.youtubeQueries) ? r.youtubeQueries : [],
        };
      } else {
        roadmap[skill] = {
          stages: [
            { level: "Beginner", topics: [], projects: [], duration: "" },
            { level: "Intermediate", topics: [], projects: [], duration: "" },
            { level: "Advanced", topics: [], projects: [], duration: "" },
          ],
          youtubeQueries: [],
        };
      }
    }
  }

  return {
    matchingSkills,
    missingSkills: missing,
    skillGapPercentage,
    roadmap,
  };
}

export async function analyzeResumeForRole(
  resumeText: string,
  jobRole: string,
  requiredSkills: string[],
): Promise<AnalyzeResumeResponse> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openRouterKey && !openaiKey) {
    throw new Error("OPENROUTER_API_KEY or OPENAI_API_KEY must be set");
  }

  const requiredSkillsJson = JSON.stringify(requiredSkills);
  const systemPrompt = buildSystemPrompt(requiredSkillsJson);
  const userPrompt = buildUserPrompt(resumeText, jobRole);

  const body = {
    model: process.env.OPENROUTER_MODEL || "openai/gpt-4.1-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
    max_tokens: 1024,
  };

  let raw: string | null = null;

  if (openRouterKey) {
    const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openRouterKey}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenRouter request failed: ${res.status} ${err}`);
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    raw = data.choices?.[0]?.message?.content ?? null;
  } else if (openaiKey) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        ...body,
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI request failed: ${res.status} ${err}`);
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    raw = data.choices?.[0]?.message?.content ?? null;
  }

  if (!raw || typeof raw !== "string") {
    throw new Error("No content returned from model");
  }

  // Strip possible markdown code fence
  const trimmed = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();

  try {
    return parseAndValidate(trimmed, requiredSkills);
  } catch (e) {
    throw new Error("Failed to parse analysis JSON from model response");
  }
}
