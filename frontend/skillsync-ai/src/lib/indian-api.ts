import type { IndianJob, JobSearchParams } from "@/types/jobs";

const BASE = "https://jobs.indianapi.in";
const CACHE_TTL_MS = 60 * 1000; // 1 min optional cache
const cache = new Map<string, { data: IndianJob[]; at: number }>();

function getCacheKey(params: JobSearchParams): string {
  return JSON.stringify(params);
}

export async function fetchJobsFromIndianAPI(
  params: JobSearchParams
): Promise<IndianJob[]> {
  const key = process.env.INDIAN_API_KEY?.trim();
  if (!key) {
    console.error("INDIAN_API_KEY is not set in .env");
    return [];
  }

  const cacheKey = getCacheKey(params);
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return hit.data;
  }

  const searchParams = new URLSearchParams();
  const limit = Math.min(params.limit ?? 20, 50);
  searchParams.set("limit", String(limit));
  if (params.title) searchParams.set("title", params.title);
  if (params.location) searchParams.set("location", params.location);
  if (params.company) searchParams.set("company", params.company);
  if (params.job_type) searchParams.set("job_type", params.job_type);
  if (params.experience) searchParams.set("experience", params.experience);
  if (params.offset) searchParams.set("offset", String(params.offset));

  const url = `${BASE}/jobs?${searchParams.toString()}`;
  try {
    const res = await fetch(url, {
      headers: { "X-Api-Key": key },
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      const err = await res.text();
      if (res.status === 401) {
        throw new Error(
          "Invalid IndianAPI key. Get a key from indianapi.in/jobs-api and set INDIAN_API_KEY in .env (no quotes, no spaces). Restart the dev server after changing .env."
        );
      }
      throw new Error(`IndianAPI ${res.status}: ${err.slice(0, 200)}`);
    }
    const data = (await res.json()) as IndianJob[];
    const list = Array.isArray(data) ? data : [];
    cache.set(cacheKey, { data: list, at: Date.now() });
    return list;
  } catch (e) {
    console.error("IndianAPI fetch error:", e);
    throw e;
  }
}

export async function fetchJobByIdFromIndianAPI(
  id: string
): Promise<IndianJob | null> {
  const key = process.env.INDIAN_API_KEY?.trim();
  if (!key) return null;
  try {
    const res = await fetch(`${BASE}/jobs/${id}`, {
      headers: { "X-Api-Key": key },
    });
    if (!res.ok) return null;
    return (await res.json()) as IndianJob;
  } catch {
    return null;
  }
}
