"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

type InterviewQuestion = {
  question: string;
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
  type?: "technical" | "behavioral" | "system-design" | "other";
};

type InterviewQuestionsResponse = {
  roleTitle?: string;
  summary?: string;
  questions: InterviewQuestion[];
};

export default function InterviewFromJDPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<InterviewQuestionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setResult(null);

      const jd = jobDescription.trim();
      if (!jd) {
        setError("Please paste a job description.");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/interview-from-jd", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobDescription: jd }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to generate interview questions.");
          return;
        }

        setResult({
          roleTitle: data.roleTitle,
          summary: data.summary,
          questions: data.questions ?? [],
        });
      } catch {
        setError(
          "Something went wrong while contacting the interview-question service. Check OPENROUTER_API_KEY in .env and try again."
        );
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
            Upload Resume
          </Link>
          <Link
            href="/ats-match"
            className="rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-md transition hover:border-violet-500/70 hover:bg-violet-500/5 hover:text-foreground"
          >
            ATS Matcher
          </Link>
        </nav>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)] lg:items-start">
        {/* Left: JD form */}
        <div className="rounded-2xl border border-border/40 bg-background/40 p-6 backdrop-blur-xl">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1">
            Interview questions from job description
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Paste a target job description. AI will generate technical and behavioural interview questions
            tailored to that role using OpenRouter.
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
                placeholder="Paste the full job posting (title, responsibilities, requirements, tech stack)..."
                className="w-full min-h-[220px] px-4 py-3 rounded-xl border border-border/60 bg-background text-foreground placeholder:text-muted-foreground focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20 outline-none transition resize-y"
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
              {loading ? "Generating questions..." : "Generate interview questions"}
            </button>
          </form>
        </div>

        {/* Right: Questions */}
        <div className="rounded-2xl border border-border/40 bg-background/40 p-6 backdrop-blur-xl">
          {!result ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4">
                <span className="text-2xl text-violet-400">❓</span>
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                No questions generated yet
              </p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Paste a job description on the left and click &quot;Generate interview questions&quot; to
                see tailored questions here.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {result.roleTitle && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Inferred role</p>
                  <p className="text-sm font-semibold text-foreground">{result.roleTitle}</p>
                </div>
              )}

              {result.summary && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    Interview focus
                  </p>
                  <p className="text-sm text-foreground/90">{result.summary}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Interview preparation questions
                </p>
                <ol className="space-y-3 text-sm text-foreground/90 list-decimal list-inside">
                  {result.questions.map((q, i) => (
                    <li key={i} className="space-y-0.5">
                      <p>{q.question}</p>
                      {(q.category || q.difficulty || q.type) && (
                        <p className="text-[0.7rem] text-muted-foreground">
                          {q.type && <span className="mr-2 capitalize">{q.type}</span>}
                          {q.category && (
                            <span className="mr-2">
                              <span className="text-muted-foreground/60">Category: </span>
                              {q.category}
                            </span>
                          )}
                          {q.difficulty && (
                            <span>
                              <span className="text-muted-foreground/60">Difficulty: </span>
                              {q.difficulty}
                            </span>
                          )}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

