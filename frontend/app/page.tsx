"use client";

import { useState, useCallback } from "react";

const API_URL = "http://localhost:5000/api/ats-match";

interface ATSResult {
  atsScore: number;
  jdSkills: string[];
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

export default function ATSResumeMatcherPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setResult(null);

      const jdTrimmed = jobDescription.trim();
      if (!jdTrimmed) {
        setError("Please enter a job description.");
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
        formData.append("jobDescription", jdTrimmed);
        formData.append("resume", resumeFile);

        const res = await fetch(API_URL, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Something went wrong.");
          return;
        }

        setResult({
          atsScore: data.atsScore ?? 0,
          jdSkills: data.jdSkills ?? [],
          resumeSkills: data.resumeSkills ?? [],
          matchedSkills: data.matchedSkills ?? [],
          missingSkills: data.missingSkills ?? [],
          improvementSuggestions: data.improvementSuggestions ?? [],
        });
      } catch {
        setError("Network error. Make sure the backend is running on port 5000.");
      } finally {
        setLoading(false);
      }
    },
    [jobDescription, resumeFile]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Card */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl shadow-black/20 p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 text-center mb-2">
            ATS Resume Matcher
          </h1>
          <p className="text-slate-600 text-center text-sm sm:text-base mb-6">
            Paste the job description and upload your resume to see your ATS score and suggestions.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="jd" className="block text-sm font-medium text-slate-700 mb-1">
                Job description
              </label>
              <textarea
                id="jd"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job posting or key requirements here..."
                className="w-full min-h-[140px] px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition text-slate-800 placeholder:text-slate-400 resize-y"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Resume (PDF only)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer"
                  disabled={loading}
                />
              </div>
              {resumeFile && (
                <p className="mt-1 text-xs text-slate-500">{resumeFile.name}</p>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
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
        {result && (
          <div className="mt-8 space-y-6">
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl shadow-black/20 p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Results</h2>

              {/* ATS Score + progress bar */}
              <div className="mb-8">
                <p className="text-sm font-medium text-slate-600 mb-1">ATS Score</p>
                <p className={`text-4xl font-bold ${getScoreColor(result.atsScore)}`}>
                  {result.atsScore}%
                </p>
                <div className="mt-3 h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor(result.atsScore)}`}
                    style={{ width: `${Math.min(100, result.atsScore)}%` }}
                  />
                </div>
              </div>

              {/* Matched skills */}
              <div className="mb-6">
                <p className="text-sm font-medium text-slate-700 mb-2">Matched skills</p>
                <div className="flex flex-wrap gap-2">
                  {result.matchedSkills.length === 0 ? (
                    <span className="text-slate-500 text-sm">None</span>
                  ) : (
                    result.matchedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                      >
                        <span aria-hidden>✔</span> {skill}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Missing skills */}
              <div className="mb-6">
                <p className="text-sm font-medium text-slate-700 mb-2">Missing skills</p>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.length === 0 ? (
                    <span className="text-slate-500 text-sm">None — you cover all listed skills.</span>
                  ) : (
                    result.missingSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
                      >
                        <span aria-hidden>✖</span> {skill}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Improvement suggestions */}
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Improvement suggestions</p>
                {result.improvementSuggestions.length === 0 ? (
                  <p className="text-slate-500 text-sm">You&apos;re aligned with the job description.</p>
                ) : (
                  <ul className="list-disc list-inside space-y-1 text-slate-700 text-sm">
                    {result.improvementSuggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
