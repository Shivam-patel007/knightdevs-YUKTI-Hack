type LearningResource = {
  skill: string;
  youtube: { title: string; url: string }[];
  courses: { title: string; platform: string; url: string }[];
  projectSuggestion: string;
  estimatedLearningTimeWeeks: number;
};

export type LearningResourcesResponse = {
  resources: LearningResource[];
};

const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

export async function generateLearningResources(missingSkills: string[]): Promise<LearningResourcesResponse> {
  if (!missingSkills.length) {
    return { resources: [] };
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openRouterKey && !openaiKey) {
    throw new Error("No OpenRouter or OpenAI API key configured");
  }

  const skillsList = missingSkills.join(", ");

  const userPrompt = `You are an AI career mentor system.

The user is missing the following technical skills:

${skillsList}

For each missing skill:

1. Recommend 3 high-quality YouTube learning videos.
2. Recommend 2 structured online courses (Coursera, Udemy, freeCodeCamp, etc.)
3. Suggest 1 practical project idea to master the skill.
4. Estimate how many weeks it would take to become internship-ready in that skill (assuming 10-12 hours per week).

IMPORTANT:
- Return only valid JSON.
- Do not add explanations.
- Do not add markdown.
- Do not include commentary.
- URLs should look realistic and valid.
- Keep titles short and professional.
- Focus on beginner to intermediate level resources.
- Optimize recommendations for Indian students.

JSON format:

{
  "resources": [
    {
      "skill": "Skill Name",
      "youtube": [
        {
          "title": "Video Title",
          "url": "https://youtube.com/..."
        }
      ],
      "courses": [
        {
          "title": "Course Title",
          "platform": "Platform Name",
          "url": "https://..."
        }
      ],
      "projectSuggestion": "Project idea description",
      "estimatedLearningTimeWeeks": number
    }
  ]
}`;

  const body = {
    model: process.env.OPENROUTER_MODEL || "openai/gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an AI career mentor for Indian college students. Always respond with strictly valid JSON that matches the requested schema.",
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    temperature: 0.4,
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
      throw new Error("OpenRouter request failed");
    }

    const data = (await res.json()) as any;
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
      throw new Error("OpenAI request failed");
    }

    const data = (await res.json()) as any;
    raw = data.choices?.[0]?.message?.content ?? null;
  }

  if (!raw) {
    throw new Error("No content returned from model");
  }

  try {
    const parsed = JSON.parse(raw) as LearningResourcesResponse;
    if (!parsed.resources) {
      return { resources: [] };
    }
    return parsed;
  } catch (error) {
    throw new Error("Failed to parse learning resources JSON");
  }
}
