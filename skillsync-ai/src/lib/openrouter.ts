/**
 * OpenRouter API client - LLM access (GPT-4o, Claude, etc.)
 * Falls back to OpenAI when OpenRouter returns 402 (no credits).
 */

const OPENROUTER_BASE = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export async function callOpenRouter<T>(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    responseFormat?: { type: "json_object" };
  }
): Promise<string> {
  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (!openRouterKey && !openaiKey) {
    throw new Error("OPENROUTER_API_KEY or OPENAI_API_KEY is required");
  }

  const maxTokens = options?.max_tokens ?? 1024;
  const temperature = options?.temperature ?? 0.2;
  const model = options?.model || DEFAULT_MODEL;

  const tryOpenAI = async (): Promise<string> => {
    const key = process.env.OPENAI_API_KEY?.trim();
    if (!key) {
      throw new Error(
        "Not enough OpenRouter credits. Add OPENAI_API_KEY to skillsync-ai/.env (not python-resume-api/.env) and restart the server."
      );
    }
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI error (${res.status}): ${err.slice(0, 200)}`);
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response from OpenAI");
    return content;
  };

  // Prefer OpenAI when key is set (avoids OpenRouter credit limits)
  if (openaiKey) {
    return tryOpenAI();
  }

  const makeOpenRouterRequest = async (includeResponseFormat: boolean) =>
    fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openRouterKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        ...(includeResponseFormat && options?.responseFormat
          ? { response_format: options.responseFormat }
          : {}),
      }),
    });

  let res = await makeOpenRouterRequest(Boolean(options?.responseFormat));
  if (!res.ok && options?.responseFormat) {
    const firstError = await res.text();
    const errorLower = firstError.toLowerCase();
    const looksLikeResponseFormatIssue =
      errorLower.includes("response_format") ||
      errorLower.includes("json_object") ||
      errorLower.includes("json mode");
    if (res.status === 400 && looksLikeResponseFormatIssue) {
      res = await makeOpenRouterRequest(false);
    }
  }

  if (res.status === 402) {
    return tryOpenAI();
  }

  if (!res.ok) {
    const err = await res.text();
    if (res.status === 401) {
      throw new Error("Invalid or expired API key. Check OPENROUTER_API_KEY in .env");
    }
    if (res.status === 429) {
      throw new Error("Rate limit exceeded. Please try again in a moment.");
    }
    throw new Error(`AI service error (${res.status}): ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenRouter");
  return content;
}
