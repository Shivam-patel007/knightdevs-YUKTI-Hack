"use client";

import { useState } from "react";
import { JobCard } from "@/components/jobs/JobCard";
import type { IndianJob } from "@/types/jobs";

const LIMIT = 12;

export default function JobsSearchPage() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [jobs, setJobs] = useState<IndianJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const handleSearch = async (e: React.FormEvent, pageNum = 1) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (title.trim()) params.set("title", title.trim());
      if (location.trim()) params.set("location", location.trim());
      if (skills.trim()) params.set("skills", skills.trim());
      params.set("page", String(pageNum));
      params.set("limit", String(LIMIT));
      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch jobs");
      setJobs(data.jobs ?? []);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">
            Job Portal
          </h1>
          <p className="mt-1 text-sm text-black/70">
            Search jobs by title, location, or skills
          </p>
        </div>
      </header>

      <form
        onSubmit={(e) => handleSearch(e, 1)}
        className="mb-8 rounded-2xl border border-white/40 bg-white/25 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-2xl"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            placeholder="Job title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border border-white/40 bg-white/30 px-4 py-3 text-black placeholder-black/50 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 backdrop-blur-xl"
          />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="rounded-xl border border-white/40 bg-white/30 px-4 py-3 text-black placeholder-black/50 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 backdrop-blur-xl"
          />
          <input
            type="text"
            placeholder="Skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="rounded-xl border border-white/40 bg-white/30 px-4 py-3 text-black placeholder-black/50 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 backdrop-blur-xl"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-violet-600 px-4 py-3 font-medium text-white shadow-lg transition hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-300 bg-rose-50/90 px-4 py-3 text-sm text-rose-800 backdrop-blur-xl">
          {error}
        </div>
      )}

      {loading && jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          <p className="mt-4 text-sm text-black/70">Loading jobs…</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-white/40 bg-white/25 p-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-2xl">
          <p className="text-black/70">
            Enter filters and click Search to find jobs.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-black/60">
            {jobs.length} job{jobs.length !== 1 ? "s" : ""} found
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job, i) => (
              <JobCard key={typeof job.id === "string" ? job.id : `job-${i}`} job={job} />
            ))}
          </div>
          <div className="mt-6 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => handleSearch(undefined as unknown as React.FormEvent, page - 1)}
              disabled={page <= 1 || loading}
              className="rounded-xl border border-white/40 bg-white/25 px-4 py-2 text-sm font-medium text-black shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-2xl disabled:opacity-50"
            >
              Previous
            </button>
            <span className="flex items-center px-4 text-sm text-black/70">
              Page {page}
            </span>
            <button
              type="button"
              onClick={() => handleSearch(undefined as unknown as React.FormEvent, page + 1)}
              disabled={jobs.length < LIMIT || loading}
              className="rounded-xl border border-white/40 bg-white/25 px-4 py-2 text-sm font-medium text-black shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-2xl disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
