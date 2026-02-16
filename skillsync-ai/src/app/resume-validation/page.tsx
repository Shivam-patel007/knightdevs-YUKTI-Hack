"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { VALIDATION_JOBS } from "@/lib/validation-jobs";

const ATS_API_URL = "/api/ats-match";
const ATS_HEALTH_URL = "/api/ats-match/health";

interface JobResult {
  jobId: string;
  jobTitle: string;
  atsScore: number;
  resumeScore: number;
  jdSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  improvementSuggestions: string[];
}

function getScoreColor(score: number): string {
  if (score <= 40) return "text-red-500";
  if (score <= 70) return "text-yellow-500";
  return "text-green-500";
}

function getProgressColor(score: number): string {
  if (score <= 40) return "bg-red-500";
  if (score <= 70) return "bg-yellow-500";
  return "bg-green-500";
}

export default function ResumeValidationPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [results, setResults] = useState<JobResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backendOk, setBackendOk] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(ATS_HEALTH_URL, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setBackendOk(d.ok === true))
      .catch(() => setBackendOk(false));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setResults(null);

      if (!resumeFile) {
        setError("Please upload your resume (PDF).");
        return;
      }
      if (resumeFile.type !== "application/pdf") {
        setError("Only PDF files are allowed.");
        return;
      }

      setLoading(true);

      try {
        const jobResults: JobResult[] = [];

        for (const job of VALIDATION_JOBS) {
          const formData = new FormData();
          formData.append("jobDescription", job.description);
          formData.append("resume", resumeFile);

          const res = await fetch(ATS_API_URL, { method: "POST", body: formData });
          const data = await res.json();

          if (!res.ok) {
            setError(data.error || `Failed to evaluate against ${job.title}.`);
            setResults(null);
            return;
          }

          jobResults.push({
            jobId: job.id,
            jobTitle: job.title,
            atsScore: data.atsScore ?? 0,
            resumeScore: data.resumeScore ?? 0,
            jdSkills: data.jdSkills ?? [],
            matchedSkills: data.matchedSkills ?? [],
            missingSkills: data.missingSkills ?? [],
            improvementSuggestions: data.improvementSuggestions ?? [],
          });
        }

        setResults(jobResults);
      } catch {
        setError("Could not reach ATS backend. Start it with: cd backend && npm start");
      } finally {
        setLoading(false);
      }
    },
    [resumeFile]
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
            href="/ats-match"
            className="rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-md transition hover:border-violet-500/70 hover:bg-violet-500/5 hover:text-foreground"
          >
            ATS Matcher
          </Link>
          <Link
            href="/upload"
            className="rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-md transition hover:border-violet-500/70 hover:bg-violet-500/5 hover:text-foreground"
          >
            Upload Resume
          </Link>
        </nav>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <div className="rounded-2xl border border-border/40 bg-background/40 p-6 backdrop-blur-xl">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1">
            Resume Evaluation & Validation
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Prove that ATS scoring works by matching your resume against <strong>3 fixed jobs</strong>.
            Each job has different required skills, so you get different scores and missing-skill lists—validating that the score is based on missing skills.
          </p>

          {backendOk === false && (
            <div className="mb-4 rounded-xl border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              <strong>ATS backend is not running.</strong> Run:{" "}
              <code className="rounded bg-black/20 px-1.5 py-0.5 font-mono text-xs">
                cd backend && npm start
              </code>
            </div>
          )}
          {backendOk === true && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-200">
              <span className="h-2 w-2 rounded-full bg-green-400" /> Backend connected
            </div>
          )}

          <p className="text-xs font-medium text-muted-foreground mb-2">Validation jobs</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground mb-6 space-y-1">
            {VALIDATION_JOBS.map((j) => (
              <li key={j.id}>{j.title}</li>
            ))}
          </ul>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Your resume (PDF)
              </label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-violet-500/20 file:text-violet-200 hover:file:bg-violet-500/30 file:cursor-pointer"
                disabled={loading}
              />
              {resumeFile && (
                <p className="mt-1.5 text-xs text-muted-foreground">{resumeFile.name}</p>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || backendOk !== true}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 to-fuchsia-500/90 shadow-lg shadow-violet-900/30 hover:opacity-90 transition disabled:opacity-70 disabled:cursor-not-allowed"
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
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Evaluating against 3 jobs...
                </span>
              ) : (
                "Evaluate against 3 jobs"
              )}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-border/40 bg-background/40 p-6 backdrop-blur-xl">
          {!results ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4">
                <span className="text-2xl text-violet-400">✓</span>
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No results yet</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Upload your resume and click &quot;Evaluate against 3 jobs&quot; to see ATS scores and missing skills for each role.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground">
                Validation results — score by job
              </h2>
              <p className="text-xs text-muted-foreground">
                Different jobs require different skills; your score and missing skills change per job, proving the ATS logic.
              </p>
              <div className="space-y-5">
                {results.map((r) => (
                  <div
                    key={r.jobId}
                    className="rounded-xl border border-border/60 bg-background/60 p-4"
                  >
                    <h3 className="text-base font-semibold text-foreground mb-3">
                      {r.jobTitle}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground mb-0.5">
                          ATS Score
                        </p>
                        <p className={`text-2xl font-bold tabular-nums ${getScoreColor(r.atsScore)}`}>
                          {r.atsScore}%
                        </p>
                        <div className="mt-1.5 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${getProgressColor(r.atsScore)}`}
                            style={{ width: `${Math.min(100, r.atsScore)}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground mb-0.5">
                          Resume Score
                        </p>
                        <p className={`text-2xl font-bold tabular-nums ${getScoreColor(r.resumeScore)}`}>
                          {r.resumeScore}%
                        </p>
                        <div className="mt-1.5 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${getProgressColor(r.resumeScore)}`}
                            style={{ width: `${Math.min(100, r.resumeScore)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {r.matchedSkills.length > 0 && (
                        <>
                          <span className="text-xs text-muted-foreground w-full">Matched:</span>
                          {r.matchedSkills.map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30"
                            >
                              ✔ {s}
                            </span>
                          ))}
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {r.missingSkills.length > 0 ? (
                        <>
                          <span className="text-xs text-muted-foreground w-full">Missing (lowers score):</span>
                          {r.missingSkills.map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30"
                            >
                              ✖ {s}
                            </span>
                          ))}
                        </>
                      ) : (
                        <span className="text-xs text-green-300">No missing skills for this job.</span>
                      )}
                    </div>
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
