import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/openrouter";
import { RoadmapResponseSchema } from "@/types/schemas";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Generate a structured learning roadmap based only on the target job description.
 * Uses OpenRouter (OpenAI-compatible API).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const jobDescription =
      typeof body?.jobDescription === "string" ? body.jobDescription.trim() : "";

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required." },
        { status: 400 }
      );
    }

    const prompt = `Based ONLY on the following job description, generate a structured learning roadmap (4 to 6 months) for someone who wants to qualify for this role. Infer the target job title and required skills from the description. Do not assume any prior skills.

Return ONLY valid JSON in this exact format (no markdown, no code fence):
{
  "months": [
    {
      "month": 1,
      "focusSkills": ["skill1", "skill2"],
      "recommendedProjects": ["project name or short description"],
      "weeklyGoals": "1-2 sentences describing what to achieve this month",
      "estimatedHoursPerWeek": 8
    }
  ]
}

Include 4 to 6 months. Each month must have: month (number), focusSkills (array of strings), recommendedProjects (array of strings), weeklyGoals (string), estimatedHoursPerWeek (number).

Job description:
"""
${jobDescription.slice(0, 15000)}
"""`;

    const content = await callOpenRouter(
      [
        {
          role: "system",
          content:
            "You are a career coach. You generate structured learning roadmaps from job descriptions. Respond only with valid JSON, no other text.",
        },
        { role: "user", content: prompt },
      ],
      {
        temperature: 0.3,
        max_tokens: 2048,
        responseFormat: { type: "json_object" },
      }
    );

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON. Please try again." },
        { status: 500 }
      );
    }

    const result = RoadmapResponseSchema.safeParse(parsed);
    if (!result.success) {
      const obj = parsed as { months?: unknown[] };
      const months = Array.isArray(obj?.months)
        ? obj.months.slice(0, 6).map((m, i) => {
            const month = m as Record<string, unknown>;
            return {
              month: (month?.month as number) ?? i + 1,
              focusSkills: Array.isArray(month?.focusSkills) ? month.focusSkills : [],
              recommendedProjects: Array.isArray(month?.recommendedProjects)
                ? month.recommendedProjects
                : [],
              weeklyGoals: typeof month?.weeklyGoals === "string" ? month.weeklyGoals : "",
              estimatedHoursPerWeek:
                typeof month?.estimatedHoursPerWeek === "number"
                  ? month.estimatedHoursPerWeek
                  : 8,
            };
          })
        : [];
      return NextResponse.json({ months });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate roadmap.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
