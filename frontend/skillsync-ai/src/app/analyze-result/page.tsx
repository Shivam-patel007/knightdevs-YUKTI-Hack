"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ResumeAnalyzerResponse } from "@/types/resume-analyzer";

const STORAGE_KEY = "resume-analyzer-result";

export default function AnalyzeResultPage() {
  const [data, setData] = useState<ResumeAnalyzerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setError("No results found. Please run an analysis first.");
        return;
      }
      const parsed = JSON.parse(raw) as ResumeAnalyzerResponse;
      setData(parsed);
    } catch {
      setError("Invalid result data.");
    }
  }, []);

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">{error}</p>
        <Link
          href="/analyze"
          className="mt-4 inline-block rounded-full bg-violet-500/20 px-5 py-2.5 text-sm font-medium text-violet-200 hover:bg-violet-500/30"
        >
          Analyze resume
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        <p className="mt-3 text-sm text-muted-foreground">Loading results…</p>
      </div>
    );
  }

  const { matched_skills, missing_skills, skill_gap_percentage, roadmap } = data;

  return (
    <div className="py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Analysis results
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Skill gap and learning roadmap with YouTube resources
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/skill-videos"
            className="rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-200 hover:bg-violet-500/20"
          >
            Search skill videos
          </Link>
          <Link
            href="/analyze"
            className="rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground/80 hover:bg-violet-500/5"
          >
            New analysis
          </Link>
        </div>
      </div>

      {/* Skill gap percentage */}
      <div className="mb-6 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/80 to-slate-900/90 p-5 shadow-xl backdrop-blur-xl">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Skill gap
        </p>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-violet-500/20 text-2xl font-bold text-violet-100">
            {skill_gap_percentage}%
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            How well your resume matches the job. Higher is better. Missing skills and a learning roadmap are below.
          </p>
        </div>
      </div>

      {/* Matched vs missing skills */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-emerald-200/80">
            Matched skills
          </p>
          <div className="flex flex-wrap gap-2">
            {matched_skills.length ? (
              matched_skills.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs text-emerald-100"
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-emerald-200/70">None detected</span>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-rose-200/80">
            Missing skills
          </p>
          <div className="flex flex-wrap gap-2">
            {missing_skills.length ? (
              missing_skills.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-rose-500/15 px-2.5 py-1 text-xs text-rose-100"
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-rose-200/70">None – great match</span>
            )}
          </div>
        </div>
      </div>

      {/* Roadmap with YouTube cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Learning roadmap</h2>
        {roadmap.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-muted-foreground">
            No roadmap items. Your resume may already cover the job requirements.
          </p>
        ) : (
          <div className="space-y-6">
            {roadmap.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-xl backdrop-blur-xl"
              >
                <h3 className="mb-3 text-base font-semibold text-white">{item.skill}</h3>

                <div className="mb-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="mb-1 text-[0.65rem] font-medium uppercase text-muted-foreground">
                      Beginner
                    </p>
                    <ul className="list-inside list-disc space-y-0.5 text-xs text-slate-300">
                      {(item.beginner_steps || []).slice(0, 3).map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-1 text-[0.65rem] font-medium uppercase text-muted-foreground">
                      Intermediate
                    </p>
                    <ul className="list-inside list-disc space-y-0.5 text-xs text-slate-300">
                      {(item.intermediate_steps || []).slice(0, 3).map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-1 text-[0.65rem] font-medium uppercase text-muted-foreground">
                      Advanced
                    </p>
                    <ul className="list-inside list-disc space-y-0.5 text-xs text-slate-300">
                      {(item.advanced_steps || []).slice(0, 3).map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {(item.youtube_resources?.length ?? 0) > 0 && (
                  <div>
                    <p className="mb-2 text-[0.65rem] font-medium uppercase text-muted-foreground">
                      YouTube resources
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.youtube_resources!.map((yt, i) => (
                        <a
                          key={i}
                          href={yt.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 transition hover:border-violet-500/40 hover:bg-violet-500/10"
                        >
                          <span className="text-red-400">▶</span>
                          <span className="max-w-[200px] truncate">{yt.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
