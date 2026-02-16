import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/openrouter";

export const runtime = "nodejs";
export const maxDuration = 60;

type InterviewQuestion = {
  question: string;
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
  type?: "technical" | "behavioral" | "system-design" | "other";
};

type InterviewQuestionsResponse = {
  roleTitle?: string;
  summary?: string;
  questions: InterviewQuestion[];
};

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

    const prompt = `You are an expert technical interviewer.

Based ONLY on the following job description, generate a structured list of interview preparation questions.
Infer the target role, core tech stack, and main responsibility areas from the JD.

Return ONLY valid JSON in this exact shape (no markdown, no extra text):
{
  "roleTitle": "string (inferred job title)",
  "summary": "2-3 sentences describing the focus of this interview",
  "questions": [
    {
      "question": "string (the interview question)",
      "category": "Tech stack / System design / Fundamentals / Behavioural / Other",
      "difficulty": "easy" | "medium" | "hard",
      "type": "technical" | "behavioral" | "system-design" | "other"
    }
  ]
}

Guidelines:
- Include 10–15 questions total.
- Mix technical and behavioural questions.
- Cover core skills, tools and responsibilities from the JD.

Job description:
\"\"\"
${jobDescription.slice(0, 15000)}
\"\"\"`;

    const content = await callOpenRouter(
      [
        {
          role: "system",
          content:
            "You are a senior interviewer helping candidates prepare. Respond only with valid JSON, no markdown or commentary.",
        },
        { role: "user", content: prompt },
      ],
      {
        temperature: 0.4,
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

    const obj = parsed as Partial<InterviewQuestionsResponse>;
    const questions = Array.isArray(obj.questions)
      ? obj.questions
          .filter(
            (q): q is InterviewQuestion =>
              !!q &&
              typeof q === "object" &&
              typeof (q as any).question === "string" &&
              (q as any).question.trim().length > 0
          )
          .slice(0, 20)
      : [];

    if (!questions.length) {
      return NextResponse.json(
        { error: "AI did not return any questions. Please try again with a longer job description." },
        { status: 500 }
      );
    }

    const safeResponse: InterviewQuestionsResponse = {
      roleTitle: obj.roleTitle || undefined,
      summary: obj.summary || undefined,
      questions,
    };

    return NextResponse.json(safeResponse);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate interview questions.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

