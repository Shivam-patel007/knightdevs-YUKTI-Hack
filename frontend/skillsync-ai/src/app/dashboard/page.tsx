"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { gsap } from "gsap";

import type { SkillComparisonResult } from "@/utils/skills";
import type { RoadmapResponse } from "@/lib/ai";
import type { AtsResult, IndustryDemand } from "@/utils/ats";
import { SkillRadar } from "@/components/SkillRadar";

function parseDashboardData(param: string | null) {
  if (!param) return null;
  try {
    const decoded = JSON.parse(param) as {
      skills: string[];
      comparison: SkillComparisonResult;
      roadmap: RoadmapResponse;
      ats?: AtsResult;
      demand?: IndustryDemand | null;
    };
    return decoded;
  } catch {
    return null;
  }
}

function DashboardContent() {
  const params = useSearchParams();
  const email = params.get("email");
  const role = params.get("role");
  const matchScore = Number(params.get("matchScore") ?? 0);
  const rawData = params.get("data");

  const parsed = useMemo(() => parseDashboardData(rawData), [rawData]);

  const cardsRef = useRef<HTMLDivElement | null>(null);
  const [isLoadingLearning, setIsLoadingLearning] = useState(false);
  const [learningError, setLearningError] = useState<string | null>(null);
  const [learningResources, setLearningResources] = useState<
    | {
        skill: string;
        youtube: { title: string; url: string }[];
        courses: { title: string; platform: string; url: string }[];
        projectSuggestion: string;
        estimatedLearningTimeWeeks: number;
      }[]
    | null
  >(null);

  useEffect(() => {
    if (cardsRef.current) {
      const targets = cardsRef.current.querySelectorAll("[data-gsap-card]");
      gsap.fromTo(
        targets,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
        },
      );
    }
  }, []);

  if (!parsed) {
    return (
      <div className="py-10 text-sm text-muted-foreground">
        Unable to load dashboard data. Please go back and re-upload your resume.
      </div>
    );
  }

  const { skills, comparison, roadmap, ats, demand } = parsed;

  const handleFetchLearning = async () => {
    if (!comparison.missingSkills.length) return;

    try {
      setLearningError(null);
      setIsLoadingLearning(true);

      const res = await fetch("/api/learning-resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missingSkills: comparison.missingSkills }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load learning resources");
      }

      setLearningResources(data.resources ?? []);
      setIsLoadingLearning(false);
    } catch (error: any) {
      setIsLoadingLearning(false);
      setLearningError(error.message || "Something went wrong while loading resources.");
    }
  };

  return (
    <div className="py-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-violet-300/70">
            AI Job & Skill Navigator
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Skill dashboard
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {email ? `Personalised view for ${email}` : "Session-based demo view"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {role && (
            <span className="rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1 text-[0.7rem] font-medium text-violet-100">
              Target role: {role}
            </span>
          )}
          {demand && (
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[0.7rem] font-medium text-emerald-100">
              Industry demand: {demand.level} ({demand.index})
            </span>
          )}
        </div>
      </div>

      <div
        ref={cardsRef}
        className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-6"
      >
        <div className="space-y-4" data-gsap-card>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/80 via-slate-900/90 to-slate-950/95 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.9)] backdrop-blur-xl">
            <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground/80">
              Match score
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <div className="relative h-24 w-24">
                <svg viewBox="0 0 100 100" className="h-24 w-24">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-slate-800"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-gradient"
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 42}
                    strokeDashoffset={
                      2 * Math.PI * 42 * (1 - Math.min(Math.max(matchScore, 0), 100) / 100)
                    }
                    style={{
                      transform: "rotate(-90deg)",
                      transformOrigin: "50% 50%",
                      stroke: "url(#matchGradient)",
                    }}
                  />
                  <defs>
                    <linearGradient id="matchGradient" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="50%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">
                  <span className="text-lg font-semibold text-slate-50">
                    {Number.isFinite(matchScore) ? matchScore : 0}%
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>
                  This is your current alignment with the selected role based on the skills detected in
                  your resume.
                </p>
                <p className="text-[0.7rem] text-slate-400">
                  Matched {comparison.matchedSkills.length} of {comparison.missingSkills.length + comparison.matchedSkills.length} required skills.
                </p>
                {ats && (
                  <p className="text-[0.7rem] text-slate-400">
                    Estimated ATS score: <span className="font-semibold text-slate-100">{ats.score}%</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]" data-gsap-card>
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4">
              <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground/80">
                Skill coverage radar
              </p>
              <div className="h-44">
                <SkillRadar
                  matchedCount={comparison.matchedSkills.length}
                  missingCount={comparison.missingSkills.length}
                />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-xs text-muted-foreground">
              <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground/80">
                Export & tips
              </p>
              <p className="mb-2 text-[0.7rem]">
                Use this view as a checklist when updating your resume or planning study sprints.
              </p>
              <button
                type="button"
                onClick={() => window.print()}
                className="mt-1 inline-flex items-center justify-center rounded-full bg-slate-100/5 px-3 py-1.5 text-[0.7rem] font-medium text-slate-100 ring-1 ring-white/15 transition hover:bg-slate-100/10"
              >
                Download roadmap (print to PDF)
              </button>
              <button
                type="button"
                disabled={isLoadingLearning || !comparison.missingSkills.length}
                onClick={handleFetchLearning}
                className="mt-2 inline-flex items-center justify-center rounded-full bg-violet-500/10 px-3 py-1.5 text-[0.7rem] font-medium text-violet-100 ring-1 ring-violet-500/30 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingLearning
                  ? "Loading learning resources..."
                  : "Get learning plan for missing skills"}
              </button>
              {ats && (
                <ul className="mt-3 list-disc space-y-1 pl-4 text-[0.7rem]">
                  {ats.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              )}
              {demand && (
                <p className="mt-3 text-[0.7rem] text-emerald-200/80">
                  {demand.summary}
                </p>
              )}
              {learningError && (
                <p className="mt-2 text-[0.7rem] text-rose-300">{learningError}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2" data-gsap-card>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-wide text-emerald-200/80">
                Your skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {skills.length ? (
                  skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.7rem] text-emerald-100"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-[0.7rem] text-emerald-100/80">
                    We couldnt detect explicit technical skills in your resume.
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-4">
              <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-wide text-rose-200/80">
                Missing skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {comparison.missingSkills.length ? (
                  comparison.missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[0.7rem] text-rose-100"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-[0.7rem] text-rose-100/80">
                    No major gaps detected for this role template.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4" data-gsap-card>
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 backdrop-blur-xl">
            <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground/80">
              6‑month roadmap
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>
                Each month has a clear focus, concrete projects, and a realistic weekly time
                commitment.
              </p>
            </div>
            <div className="mt-4 space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {roadmap.months.map((month) => (
                <details
                  key={month.month}
                  className="group rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-xs text-slate-200"
                  open={month.month === 1}
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-2 text-[0.75rem] font-medium text-slate-50">
                    <span>Month {month.month}</span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[0.65rem] text-slate-300">
                      {month.estimatedHoursPerWeek} hrs/week
                    </span>
                  </summary>
                  <div className="mt-2 space-y-2 text-[0.7rem] text-slate-200">
                    <div>
                      <p className="mb-1 font-medium text-slate-100">Focus skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {month.focusSkills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-slate-800 px-2 py-0.5 text-[0.65rem] text-slate-100"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-slate-100">Recommended projects</p>
                      <ul className="list-disc space-y-1 pl-4">
                        {month.recommendedProjects.map((proj) => (
                          <li key={proj} className="text-[0.7rem] text-slate-200">
                            {proj}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-1 font-medium text-slate-100">Weekly goals</p>
                      <p className="text-[0.7rem] text-slate-200">{month.weeklyGoals}</p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>

          {learningResources && learningResources.length > 0 && (
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-xs text-slate-200">
              <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground/80">
                AI learning resources for your gaps
              </p>
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {learningResources.map((item) => (
                  <div
                    key={item.skill}
                    className="rounded-2xl border border-white/10 bg-slate-900/80 p-3"
                  >
                    <p className="mb-1 text-[0.75rem] font-semibold text-slate-50">
                      {item.skill}
                    </p>
                    <p className="mb-1 text-[0.7rem] text-slate-300">
                      Estimated time: {item.estimatedLearningTimeWeeks} weeks (10–12 hrs/week)
                    </p>
                    <p className="mt-1 text-[0.7rem] font-medium text-slate-100">YouTube</p>
                    <ul className="mb-1 list-disc space-y-0.5 pl-4 text-[0.7rem] text-slate-200">
                      {item.youtube.slice(0, 3).map((yt) => (
                        <li key={yt.url}>
                          <a
                            href={yt.url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline-offset-2 hover:underline"
                          >
                            {yt.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-1 text-[0.7rem] font-medium text-slate-100">Courses</p>
                    <ul className="mb-1 list-disc space-y-0.5 pl-4 text-[0.7rem] text-slate-200">
                      {item.courses.slice(0, 2).map((course) => (
                        <li key={course.url}>
                          <span className="font-medium">{course.platform}:</span>{" "}
                          <a
                            href={course.url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline-offset-2 hover:underline"
                          >
                            {course.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-1 text-[0.7rem] font-medium text-slate-100">
                      Project idea
                    </p>
                    <p className="text-[0.7rem] text-slate-200">{item.projectSuggestion}</p>
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

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="py-10 text-sm text-muted-foreground">Loading dashboard…</div>}>
      <DashboardContent />
    </Suspense>
  );
}
