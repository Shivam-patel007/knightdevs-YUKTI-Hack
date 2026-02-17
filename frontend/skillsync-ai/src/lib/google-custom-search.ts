/**
 * Google Custom Search API for job search (role, location, skills).
 * Uses GOOGLE_CUSTOM_SEARCH_API_KEY and CUSTOM_SEARCH_ENGINE_ID from env.
 */

const BASE = "https://www.googleapis.com/customsearch/v1";

export type CustomSearchJob = {
  id: string;
  title: string;
  job_title?: string;
  company: string;
  job_description: string;
  location?: string;
  apply_link: string;
  snippet?: string;
};

function base64UrlEncode(str: string): string {
  return Buffer.from(str, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);
  return Buffer.from(b64, "base64").toString("utf8");
}

export function decodeJobId(id: string): CustomSearchJob | null {
  try {
    const json = base64UrlDecode(id);
    const o = JSON.parse(json) as CustomSearchJob;
    if (o && o.title && o.apply_link) return o;
  } catch {
    // ignore
  }
  return null;
}

export async function fetchJobsFromCustomSearch(params: {
  title?: string;
  location?: string;
  skills?: string;
  limit?: number;
  offset?: number;
}): Promise<CustomSearchJob[]> {
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY?.trim();
  const cx = process.env.CUSTOM_SEARCH_ENGINE_ID?.trim();
  if (!apiKey) {
    console.error("GOOGLE_CUSTOM_SEARCH_API_KEY is not set in .env");
    return [];
  }
  if (!cx) {
    console.error("CUSTOM_SEARCH_ENGINE_ID is not set. Create a search engine at https://programmablesearchengine.google.com/");
    return [];
  }

  const parts: string[] = ["jobs"];
  if (params.title?.trim()) parts.push(params.title.trim());
  if (params.skills?.trim()) parts.push(params.skills.trim());
  if (params.location?.trim()) parts.push(params.location.trim());
  const q = parts.join(" ");
  const start = Math.max(1, (params.offset ?? 0) + 1);
  const num = Math.min(10, Math.max(1, params.limit ?? 10));

  const url = `${BASE}?key=${encodeURIComponent(apiKey)}&cx=${encodeURIComponent(cx)}&q=${encodeURIComponent(q)}&start=${start}&num=${num}`;
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) {
      const err = await res.text();
      let msg = `Custom Search API ${res.status}: ${err.slice(0, 300)}`;
      if (res.status === 401 || res.status === 403) {
        msg =
          "Custom Search API 403: Enable the API and link billing. " +
          "1) console.cloud.google.com → Billing → link a billing account to your project (required even for free tier). " +
          "2) APIs & Services → Library → enable 'Custom Search API'. " +
          "3) Credentials → API key with no Application restriction. " +
          `Google: ${err.slice(0, 180)}`;
      }
      throw new Error(msg);
    }
    const data = (await res.json()) as {
      items?: Array<{
        title?: string;
        link?: string;
        snippet?: string;
      }>;
    };
    const items = data.items ?? [];
    const location = params.location?.trim() || undefined;
    return items.map((item, i) => {
      const title = item.title || "Job listing";
      const link = item.link || "#";
      const snippet = item.snippet || "";
      const payload: CustomSearchJob = {
        id: "",
        title,
        job_title: title,
        company: "",
        job_description: snippet,
        location,
        apply_link: link,
        snippet,
      };
      payload.id = base64UrlEncode(JSON.stringify(payload));
      return payload;
    });
  } catch (e) {
    console.error("Custom Search API error:", e);
    throw e;
  }
}
