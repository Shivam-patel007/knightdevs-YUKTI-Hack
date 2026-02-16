"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

interface RoadmapMonth {
  month: number;
  focusSkills: string[];
  recommendedProjects: string[];
  weeklyGoals: string;
  estimatedHoursPerWeek: number;
}

interface RoadmapData {
  months: RoadmapMonth[];
}

export default function RoadmapFromJDPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setRoadmap(null);

      const jd = jobDescription.trim();
      if (!jd) {
        setError("Please paste a job description.");
        return;
      }

      setLoading(true);

      try {
        const res = await fetch("/api/roadmap-from-jd", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobDescription: jd }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to generate roadmap.");
          return;
        }

        setRoadmap(
          data.months?.length
            ? { months: data.months }
            : { months: [] }
        );
      } catch {
        setError("Something went wrong. Check OPENROUTER_API_KEY in .env and try again.");
      } finally {
        setLoading(false);
      }
    },
    [jobDescription]
  );

  return (
    <div className="flex min-h-[70vh] flex-col gap-8 py-6">
      <header className="flex items-center justify-between gap-4 border-b border-border/40 pb-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <span aria-hidden>←</span> Home
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/upload"
            className="rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-md transition hover:border-violet-500/70 hover:bg-violet-500/5 hover:text-foreground"
          >
            Upload & Roadmap
          </Link>
          <Link
            href="/ats-match"
            className="rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-md transition hover:border-violet-500/70 hover:bg-violet-500/5 hover:text-foreground"
          >
            ATS Matcher
          </Link>
        </nav>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start">
        <div className="rounded-2xl border border-border/40 bg-background/40 p-6 backdrop-blur-xl">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1">
            Learning roadmap from job description
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Paste a target job description. AI will generate a structured 4–6 month learning roadmap using OpenRouter.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="jd" className="block text-sm font-medium text-foreground mb-1.5">
                Job description
              </label>
              <textarea
                id="jd"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job posting (title, requirements, responsibilities)..."
                className="w-full min-h-[200px] px-4 py-3 rounded-xl border border-border/60 bg-background text-foreground placeholder:text-muted-foreground focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20 outline-none transition resize-y"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 via-fuchsia-500/90 to-violet-500 shadow-lg shadow-violet-900/30 hover:opacity-90 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generating roadmap...
                </span>
              ) : (
                "Generate roadmap"
              )}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-border/40 bg-background/40 p-6 backdrop-blur-xl">
          {!roadmap ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4">
                <span className="text-2xl text-violet-400">🗺️</span>
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No roadmap yet</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Paste a job description and click &quot;Generate roadmap&quot; to get a structured learning plan.
              </p>
            </div>
          ) : roadmap.months.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8">No phases generated. Try again with a longer job description.</p>
          ) : (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground">
                Your learning roadmap
              </h2>
              <div className="space-y-4">
                {roadmap.months.map((phase) => (
                  <div
                    key={phase.month}
                    className="rounded-xl border border-border/60 bg-background/60 p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-violet-300">
                        Month {phase.month}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ~{phase.estimatedHoursPerWeek}h/week
                      </span>
                    </div>
                    {phase.weeklyGoals && (
                      <p className="text-sm text-foreground/90 mb-3">
                        {phase.weeklyGoals}
                      </p>
                    )}
                    {phase.focusSkills?.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">
                          Focus skills
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {phase.focusSkills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-500/20 text-violet-200 border border-violet-500/30"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {phase.recommendedProjects?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">
                          Recommended projects
                        </p>
                        <ul className="list-disc list-inside text-sm text-foreground/80 space-y-0.5">
                          {phase.recommendedProjects.map((proj, i) => (
                            <li key={i}>{proj}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
