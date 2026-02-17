/**
 * SerpAPI Google Jobs for job search (role, location, skills).
 * Uses both SERP_API_KEY and SEARCH_API_KEY when set; merges and dedupes results.
 */

import type { CustomSearchJob } from "@/lib/google-custom-search";

const BASE = "https://serpapi.com/search";

function base64UrlEncode(str: string): string {
  return Buffer.from(str, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

type SerpJob = {
  title?: string;
  link?: string;
  company_name?: string;
  location?: string;
  via?: string;
  description?: string;
  extensions?: string[];
  apply_options?: Array<{ title?: string; link?: string }>;
  detected_extensions?: Record<string, unknown>;
};

type SerpResponse = {
  jobs_results?:
    | { jobs?: SerpJob[]; link?: string }
    | SerpJob[];
  error?: string;
};

async function fetchWithKey(
  apiKey: string,
  params: { title?: string; location?: string; skills?: string; limit?: number },
  q: string
): Promise<CustomSearchJob[]> {
  const searchParams = new URLSearchParams({
    engine: "google_jobs",
    q,
    api_key: apiKey,
  });
  if (params.location?.trim()) {
    searchParams.set("location", params.location.trim());
  }

  const url = `${BASE}?${searchParams.toString()}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SerpAPI ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = (await res.json()) as SerpResponse;
  if (data.error) {
    throw new Error(`SerpAPI error: ${data.error}`);
  }

  const raw = data.jobs_results;
  const jobs: SerpJob[] = Array.isArray(raw)
    ? raw
    : raw?.jobs ?? [];

  return jobs.slice(0, params.limit ?? 20).map((item): CustomSearchJob => {
    const title = item.title || "Job listing";
    const applyLink =
      item.apply_options?.[0]?.link ?? item.link ?? "#";
    const company = item.company_name || "";
    const location = item.location || params.location?.trim() || undefined;
    const jobDescription =
      item.description ||
      [
        company && `Company: ${company}`,
        location && `Location: ${location}`,
        item.via && item.via,
        ...(item.extensions ?? []),
      ]
        .filter(Boolean)
        .join(" · ");

    const payload: CustomSearchJob = {
      id: "",
      title,
      job_title: title,
      company,
      job_description: jobDescription,
      location,
      apply_link: applyLink,
      snippet: item.description?.slice(0, 300) ?? jobDescription,
    };
    payload.id = base64UrlEncode(JSON.stringify(payload));
    return payload;
  });
}

function dedupeJobs(jobs: CustomSearchJob[]): CustomSearchJob[] {
  const seen = new Set<string>();
  return jobs.filter((job) => {
    const key = `${(job.title ?? "").toLowerCase()}|${(job.company ?? "").toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function fetchJobsFromSerpApi(params: {
  title?: string;
  location?: string;
  skills?: string;
  limit?: number;
  offset?: number;
}): Promise<CustomSearchJob[]> {
  const serpKey = process.env.SERP_API_KEY?.trim();
  const searchKey = process.env.SEARCH_API_KEY?.trim();
  const keys = [serpKey, searchKey].filter(Boolean) as string[];
  if (keys.length === 0) {
    console.error("SERP_API_KEY or SEARCH_API_KEY is not set in .env");
    throw new Error("SERP_API_KEY or SEARCH_API_KEY is not set in .env");
  }

  const parts: string[] = ["jobs"];
  if (params.title?.trim()) parts.push(params.title.trim());
  if (params.skills?.trim()) parts.push(params.skills.trim());
  if (params.location?.trim()) parts.push(params.location.trim());
  const q = parts.join(" ");
  const limit = params.limit ?? 20;

  const results = await Promise.allSettled(
    keys.map((key) => fetchWithKey(key, { ...params, limit: Math.ceil(limit / keys.length) + 5 }, q))
  );

  const all: CustomSearchJob[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }
  const merged = dedupeJobs(all);
  return merged.slice(0, limit);
}
