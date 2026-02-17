"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "resume-analyzer-result";

function LoadingDots() {
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <span className="h-1 w-1 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.15s]" />
      <span className="h-1 w-1 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.05s]" />
      <span className="h-1 w-1 animate-bounce rounded-full bg-violet-400" />
    </div>
  );
}

export default function AnalyzePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [critique, setCritique] = useState<string | null>(null);
  const [isCritiquing, setIsCritiquing] = useState(false);
  const [critiqueError, setCritiqueError] = useState<string | null>(null);

  const onFileChange = (f: File | null) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      setFile(null);
      return;
    }
    setError(null);
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onFileChange(dropped);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please upload a PDF resume.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please enter the job description.");
      return;
    }

    try {
      setError(null);
      setIsParsing(true);

      const formData = new FormData();
      formData.append("file", file);
      const parseRes = await fetch("/api/parse-resume", { method: "POST", body: formData });
      const parseData = await parseRes.json();
      if (!parseRes.ok) throw new Error(parseData.error || "Failed to parse resume");

      setIsParsing(false);
      setIsAnalyzing(true);

      const analyzeRes = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: parseData.text,
          jobDescription: jobDescription.trim(),
        }),
      });

      const result = await analyzeRes.json();
      if (!analyzeRes.ok) {
        throw new Error(
          result.error || result.message || `Analysis failed (${analyzeRes.status})`
        );
      }

      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
      } catch (_) {}
      router.push("/analyze-result");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsParsing(false);
      setIsAnalyzing(false);
    }
  };

  const pythonCritiqueUrl = process.env.NEXT_PUBLIC_PYTHON_CRITIQUE_URL?.trim();

  const handleGetCritique = async () => {
    if (!file) return;
    setCritiqueError(null);
    setCritique(null);
    setIsCritiquing(true);
    try {
      if (pythonCritiqueUrl) {
        const formData = new FormData();
        formData.append("file", file);
        if (jobRole.trim()) formData.append("job_role", jobRole.trim());
        const url = `${pythonCritiqueUrl.replace(/\/$/, "")}/analyze`;
        let res: Response;
        try {
          res = await fetch(url, { method: "POST", body: formData });
        } catch (netErr) {
          throw new Error(
            `Cannot reach Python API at ${pythonCritiqueUrl}. Is the server running? Run: cd python-resume-api && uvicorn main:app --reload --port 8000`
          );
        }
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const detail = data.detail;
          const msg =
            typeof detail === "string"
              ? detail
              : Array.isArray(detail) && detail[0]?.msg
                ? detail.map((d: { msg?: string }) => d.msg).join(". ")
                : data.error || `Python API error (${res.status})`;
          throw new Error(msg);
        }
        setCritique(data.analysis ?? "");
      } else {
        const formData = new FormData();
        formData.append("file", file);
        const parseRes = await fetch("/api/parse-resume", { method: "POST", body: formData });
        const parseData = await parseRes.json();
        if (!parseRes.ok) throw new Error(parseData.error || "Failed to parse resume");

        const critiqueRes = await fetch("/api/critique-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeText: parseData.text,
            jobRole: jobRole.trim() || undefined,
          }),
        });
        const data = await critiqueRes.json();
        if (!critiqueRes.ok) throw new Error(data.error || "Critique failed");
        setCritique(data.analysis);
      }
    } catch (err: unknown) {
      setCritiqueError(err instanceof Error ? err.message : "Failed to get critique.");
    } finally {
      setIsCritiquing(false);
    }
  };

  const isLoading = isParsing || isAnalyzing;

  return (
    <div className="py-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Resume Analyzer
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Upload your resume and paste the job description. We&apos;ll show skill gaps and a learning roadmap with YouTube resources.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-md transition hover:bg-violet-500/5"
        >
          ← Home
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-3xl border border-white/[0.12] bg-white/[0.04] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.15)] backdrop-blur-xl">
          <label className="mb-2 block text-xs font-medium text-muted-foreground">
            Resume (PDF)
          </label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDrop={handleDrop}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-8 text-center text-xs text-muted-foreground transition",
              "border-white/[0.15] bg-white/[0.03] hover:border-violet-500/40 hover:bg-white/[0.06]",
              dragActive && "border-violet-500/60 bg-white/[0.08]"
            )}
            onClick={() => document.getElementById("resume-input")?.click()}
          >
            <input
              id="resume-input"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            />
            <p className="font-medium text-slate-100">Drag & drop PDF or click to browse</p>
            {file && <p className="text-emerald-300">Selected: {file.name}</p>}
          </div>
        </div>

        <div className="rounded-3xl border border-white/[0.12] bg-white/[0.04] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.15)] backdrop-blur-xl">
          <label className="mb-2 block text-xs font-medium text-muted-foreground">
            Job description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here (requirements, responsibilities, preferred skills...)"
            rows={8}
            className="w-full rounded-2xl border border-white/[0.1] bg-white/[0.06] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-violet-500/40 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
          />
        </div>

        <div className="rounded-3xl border border-white/[0.12] bg-white/[0.04] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.15)] backdrop-blur-xl">
          <label className="mb-2 block text-xs font-medium text-muted-foreground">
            Target job role for AI critique (optional)
          </label>
          <input
            type="text"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            placeholder="e.g. Senior Frontend Developer"
            className="w-full rounded-2xl border border-white/[0.1] bg-white/[0.06] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-violet-500/40 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
          />
          <button
            type="button"
            onClick={handleGetCritique}
            disabled={!file || isCritiquing}
            className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-full border border-violet-500/50 bg-violet-500/20 px-5 text-sm font-medium text-white transition hover:bg-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCritiquing ? (
              <>
                Getting AI critique…
                <LoadingDots />
              </>
            ) : (
              "Get AI narrative critique"
            )}
          </button>
          {critiqueError && (
            <p className="mt-2 text-sm text-rose-300">{critiqueError}</p>
          )}
          {critique && (
            <div className="mt-4 rounded-2xl border border-white/[0.1] bg-white/[0.04] p-4">
              <h3 className="mb-2 text-sm font-semibold text-foreground">AI critique</h3>
              <div className="whitespace-pre-wrap text-sm text-muted-foreground">{critique}</div>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-400 px-6 text-sm font-medium text-white shadow-lg shadow-violet-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
        >
          {isLoading ? (
            <>
              {isParsing ? "Parsing resume…" : "Analyzing & fetching YouTube resources…"}
              <LoadingDots />
            </>
          ) : (
            "Analyze resume"
          )}
        </button>
      </form>
    </div>
  );
}
