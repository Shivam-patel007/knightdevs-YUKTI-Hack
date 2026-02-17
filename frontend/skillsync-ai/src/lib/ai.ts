import OpenAI from "openai";

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey });
}

export type ExtractedSkillsResponse = {
  skills: string[];
};

export async function extractSkills(resumeText: string): Promise<ExtractedSkillsResponse> {
  const openai = getOpenAI();

  const prompt = `Extract all technical skills from this resume. Return JSON only in the following format:
{
  "skills": string[]
}

Resume:
"""
${resumeText}
"""`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an assistant that extracts structured skill information and responds strictly with JSON.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.1,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";

  try {
    const parsed = JSON.parse(raw) as ExtractedSkillsResponse;
    return {
      skills: Array.from(new Set((parsed.skills || []).map((s) => s.trim()))).filter(Boolean),
    };
  } catch (error) {
    throw new Error("Failed to parse skills JSON from OpenAI response");
  }
}

export type RoadmapMonth = {
  month: number;
  focusSkills: string[];
  recommendedProjects: string[];
  weeklyGoals: string;
  estimatedHoursPerWeek: number;
};

export type RoadmapResponse = {
  months: RoadmapMonth[];
};

export async function generateRoadmap(
  role: string,
  missingSkills: string[],
): Promise<RoadmapResponse> {
  const openai = getOpenAI();

  const prompt = `Generate a structured 6-month learning roadmap in JSON format.
Each month must include: focusSkills, recommendedProjects, weeklyGoals, estimatedHoursPerWeek.
Return ONLY valid JSON in the following structure, no extra text:
{
  "months": [
    {
      "month": number,
      "focusSkills": string[],
      "recommendedProjects": string[],
      "weeklyGoals": string,
      "estimatedHoursPerWeek": number
    }
  ]
}

Target role: ${role}
Missing skills: ${missingSkills.join(", ")}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an assistant that designs concise, realistic learning roadmaps and responds strictly with JSON.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";

  try {
    const parsed = JSON.parse(raw) as RoadmapResponse;
    return {
      months: (parsed.months || []).map((m, idx) => ({
        month: m.month ?? idx + 1,
        focusSkills: m.focusSkills || [],
        recommendedProjects: m.recommendedProjects || [],
        weeklyGoals: m.weeklyGoals || "",
        estimatedHoursPerWeek: m.estimatedHoursPerWeek ?? 8,
      })),
    };
  } catch (error) {
    throw new Error("Failed to parse roadmap JSON from OpenAI response");
  }
}
