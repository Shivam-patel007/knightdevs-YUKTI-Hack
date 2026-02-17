import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/openrouter";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * AI Resume Critiquer (same behavior as the Python Streamlit app).
 * POST /api/critique-resume
 * Body: { resumeText: string, jobRole?: string }
 * Returns: { analysis: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeText, jobRole } = body as {
      resumeText?: string;
      jobRole?: string;
    };

    if (!resumeText?.trim()) {
      return NextResponse.json(
        { error: "Missing resume text" },
        { status: 400 }
      );
    }

    const targetRole = typeof jobRole === "string" ? jobRole.trim() : "";
    const prompt = `Please analyze this resume and provide constructive feedback.
Focus on the following aspects:
1. Content clarity and impact
2. Skills presentation
3. Experience description
4. Specific improvements for ${targetRole || "general job applications"}

Resume content:
${resumeText.slice(0, 14000)}

Please provide your analysis in a clear, structured format with specific recommendations.`;

    const analysis = await callOpenRouter(
      [
        {
          role: "system",
          content:
            "You are an expert resume reviewer with years of experience in HR and recruitment.",
        },
        { role: "user", content: prompt },
      ],
      { model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini", temperature: 0.7 }
    );

    return NextResponse.json({ analysis });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Critique failed. Please try again.";
    console.error("/api/critique-resume error", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
