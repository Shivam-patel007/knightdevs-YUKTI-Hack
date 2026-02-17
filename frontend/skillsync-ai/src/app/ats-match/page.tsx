"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { JOB_ROLES, CUSTOM_JOB_ID, getJobRoleById } from "@/lib/job-roles";

const ATS_API_URL = "/api/ats-match";
const ATS_API_SKILLS_URL = "/api/ats-match-skills";
const ATS_HEALTH_URL = "/api/ats-match/health";

interface ATSResult {
  atsScore: number;
  resumeScore: number;
  requiredSkills: string[]; // For job roles (stored skills)
  jdSkills?: string[]; // For custom job description (extracted)
  resumeSkills: string[];
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

/** Escape special regex characters in a string for use in RegExp */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Returns the job description with missing skill keywords highlighted (wrapped in <mark>).
 * Uses case-insensitive matching; longer skills are applied first to avoid partial matches.
 */
function highlightMissingKeywords(jobDescription: string, missingSkills: string[]): string {
  if (!missingSkills.length) return jobDescription;
  let text = jobDescription
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const sorted = [...missingSkills].sort((a, b) => b.length - a.length);
  for (const skill of sorted) {
    const escaped = escapeRegex(skill);
    const re = new RegExp(`(${escaped})`, "gi");
    text = text.replace(re, '<mark class="ats-missing-highlight">$1</mark>');
  }
  return text;
}

export default function ATSMatchPage() {
  const [selectedJobId, setSelectedJobId] = useState<string>(CUSTOM_JOB_ID);
  const [customJobDescription, setCustomJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [lastUsedJobDescription, setLastUsedJobDescription] = useState("");
  const [resultJobId, setResultJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backendOk, setBackendOk] = useState<boolean | null>(null);

  const jobDescriptionToUse =
    selectedJobId === CUSTOM_JOB_ID
      ? customJobDescription.trim()
      : getJobRoleById(selectedJobId)?.description ?? customJobDescription.trim();

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
      setResult(null);

      const jd = jobDescriptionToUse;
      if (!jd) {
        setError(selectedJobId === CUSTOM_JOB_ID ? "Please enter a job description." : "Please select a job role.");
        return;
      }
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
        const formData = new FormData();
        formData.append("resume", resumeFile);

        let apiUrl = ATS_API_URL;
        if (selectedJobId !== CUSTOM_JOB_ID) {
          const selectedRole = getJobRoleById(selectedJobId);
          if (!selectedRole) {
            setError("Invalid job role selected.");
            return;
          }
          formData.append("requiredSkills", JSON.stringify(selectedRole.requiredSkills));
          apiUrl = ATS_API_SKILLS_URL;
        } else {
          formData.append("jobDescription", jd);
        }

        const res = await fetch(apiUrl, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Something went wrong.");
          return;
        }

        if (selectedJobId === CUSTOM_JOB_ID) {
          setLastUsedJobDescription(jd);
        }
        setResultJobId(selectedJobId);

        setResult({
          atsScore: data.atsScore ?? 0,
          resumeScore: data.resumeScore ?? 0,
          requiredSkills: data.requiredSkills ?? data.jdSkills ?? [],
          jdSkills: data.jdSkills,
          resumeSkills: data.resumeSkills ?? [],
          matchedSkills: data.matchedSkills ?? [],
          missingSkills: data.missingSkills ?? [],
          improvementSuggestions: data.improvementSuggestions ?? [],
        });
      } catch {
        setError("ATS backend is not running. Start it with: cd backend && npm start (port 5000).");
      } finally {
        setLoading(false);
      }
    },
    [jobDescriptionToUse, selectedJobId, resumeFile]
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
            href="/analyze"
            className="rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-md transition hover:border-violet-500/70 hover:bg-violet-500/5 hover:text-foreground"
          >
            Resume Analyzer
          </Link>
          <Link
            href="/upload"
            className="rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-md transition hover:border-violet-500/70 hover:bg-violet-500/5 hover:text-foreground"
          >
            Upload Resume
          </Link>
        </nav>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
        {/* Form card */}
        <div className="rounded-2xl border border-border/40 bg-background/40 p-6 backdrop-blur-xl">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1">
            ATS Resume Matcher
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            Select a job role from the dropdown to match your resume against stored required skills, or choose &quot;Custom&quot; to paste your own job description. Upload your resume (PDF) to get your ATS score, matched skills, and missing skills.
          </p>

          {backendOk === false && (
            <div className="mb-4 rounded-xl border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              <strong>ATS backend is not running.</strong> Open a new terminal and run:{" "}
              <code className="rounded bg-black/20 px-1.5 py-0.5 font-mono text-xs">
                cd backend && npm start
              </code>{" "}
              (keep it open). Then refresh this page.
            </div>
          )}
          {backendOk === true && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-200">
              <span className="h-2 w-2 rounded-full bg-green-400" /> Backend connected
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="ats-job-role" className="block text-sm font-medium text-foreground mb-1.5">
                Job role
              </label>
              <select
                id="ats-job-role"
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border/60 bg-background text-foreground focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20 outline-none transition"
                disabled={loading}
              >
                <option value={CUSTOM_JOB_ID}>Custom (paste your own description)</option>
                {JOB_ROLES.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedJobId === CUSTOM_JOB_ID && (
              <div>
                <label htmlFor="ats-jd" className="block text-sm font-medium text-foreground mb-1.5">
                  Job description
                </label>
                <textarea
                  id="ats-jd"
                  value={customJobDescription}
                  onChange={(e) => setCustomJobDescription(e.target.value)}
                  placeholder="Paste the full job posting or key requirements here..."
                  className="w-full min-h-[140px] px-4 py-3 rounded-xl border border-border/60 bg-background text-foreground placeholder:text-muted-foreground focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20 outline-none transition resize-y"
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Resume (PDF supported)
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
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 via-fuchsia-500/90 to-violet-500 bg-[length:200%_100%] hover:bg-right transition-[background-position] duration-500 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-background shadow-lg shadow-violet-900/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
              style={{ backgroundPosition: "0% 50%" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundPosition = "100% 50%"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundPosition = "0% 50%"}
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
                  Analyzing...
                </span>
              ) : (
                "Get ATS Score"
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-border/40 bg-background/40 p-6 backdrop-blur-xl">
          {!result ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4">
                <span className="text-2xl text-violet-400">📊</span>
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No results yet</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Select a job role from the dropdown (or choose Custom to paste your own), upload your resume PDF, and click &quot;Get ATS Score&quot; to see matched and missing skills with percentage score.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground">Results</h2>

              {/* ATS Score & Resume Score – prominent */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border/60 bg-background/60 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                    ATS Score
                  </p>
                  <p className={`text-5xl font-bold tabular-nums ${getScoreColor(result.atsScore)}`}>
                    {result.atsScore}%
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {resultJobId === CUSTOM_JOB_ID
                      ? "Match: job description vs resume skills"
                      : `Match: ${result.matchedSkills.length} of ${result.requiredSkills.length} required skills`}
                  </p>
                  <div className="mt-4 h-3 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor(result.atsScore)}`}
                      style={{ width: `${Math.min(100, result.atsScore)}%` }}
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/60 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                    Resume Score
                  </p>
                  <p className={`text-5xl font-bold tabular-nums ${getScoreColor(result.resumeScore)}`}>
                    {result.resumeScore}%
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Based on skills & content in your resume
                  </p>
                  <div className="mt-4 h-3 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor(result.resumeScore)}`}
                      style={{ width: `${Math.min(100, result.resumeScore)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Job description with missing skill keywords highlighted (only for custom) */}
              {resultJobId === CUSTOM_JOB_ID && result.missingSkills.length > 0 && lastUsedJobDescription && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Job description — missing skill keywords highlighted
                  </p>
                  <div
                    className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words [&_.ats-missing-highlight]:bg-amber-400/80 [&_.ats-missing-highlight]:text-black [&_.ats-missing-highlight]:px-1 [&_.ats-missing-highlight]:rounded [&_.ats-missing-highlight]:font-semibold"
                    dangerouslySetInnerHTML={{
                      __html: highlightMissingKeywords(lastUsedJobDescription, result.missingSkills),
                    }}
                  />
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {resultJobId === CUSTOM_JOB_ID ? "Matched skills" : "Matched skills (from required)"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.matchedSkills.length === 0 ? (
                    <span className="text-sm text-muted-foreground">None</span>
                  ) : (
                    result.matchedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-500/30"
                      >
                        <span aria-hidden>✔</span> {skill}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Missing skills (required but not in resume)
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.length === 0 ? (
                    <span className="text-sm text-muted-foreground">None — you cover all listed skills.</span>
                  ) : (
                    result.missingSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-300 border border-red-500/30"
                      >
                        <span aria-hidden>✖</span> {skill}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {resultJobId === CUSTOM_JOB_ID ? "Skills in job description" : "Required skills for this role"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.requiredSkills.length === 0 ? (
                    <span className="text-sm text-muted-foreground">None.</span>
                  ) : (
                    result.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-violet-500/20 text-violet-200 border border-violet-500/30"
                      >
                        {skill}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Improvement suggestions</p>
                {result.improvementSuggestions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">You&apos;re aligned with the job description.</p>
                ) : (
                  <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
                    {result.improvementSuggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
