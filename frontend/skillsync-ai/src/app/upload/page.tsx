"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ROLE_DEFINITIONS } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { gsap } from "gsap";

function LoadingDots() {
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <span className="h-1 w-1 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.15s]" />
      <span className="h-1 w-1 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.05s]" />
      <span className="h-1 w-1 animate-bounce rounded-full bg-violet-400" />
    </div>
  );
}

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(ROLE_DEFINITIONS[0]?.roleName ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      );
    }
  }, []);

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
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      onFileChange(droppedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please upload a PDF resume.");
      return;
    }
    if (!email?.trim()) {
      setError("Please enter your email (used for dashboard identification).");
      return;
    }

    try {
      setError(null);
      setIsParsing(true);

      const formData = new FormData();
      formData.append("file", file);

      const parseRes = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      const parseData = await parseRes.json();
      if (!parseRes.ok) {
        throw new Error(parseData.error || "Failed to parse resume");
      }

      setIsParsing(false);
      setIsAnalyzing(true);

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          resumeText: parseData.text as string,
          selectedRole: role,
        }),
      });

      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) {
        throw new Error(analyzeData.error || "Failed to analyze resume");
      }

      setIsAnalyzing(false);

      const searchParams = new URLSearchParams({
        email,
        role,
        matchScore: String(analyzeData.comparison.matchScore ?? 0),
        data: JSON.stringify({
          skills: analyzeData.skills,
          comparison: analyzeData.comparison,
          roadmap: analyzeData.roadmap,
          ats: analyzeData.ats,
          demand: analyzeData.demand,
        }),
      }).toString();

      router.push(`/dashboard?${searchParams}`);
    } catch (err: any) {
      console.error(err);
      setIsParsing(false);
      setIsAnalyzing(false);
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  const isLoading = isParsing || isAnalyzing;

  return (
    <div className="py-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Upload your resume
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            PDF only. Well parse your skills, compare them to a role, and generate a 6-month roadmap.
          </p>
        </div>
      </div>

      <div
        ref={cardRef}
        className="grid gap-6 rounded-3xl border border-white/[0.12] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-3xl md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
        style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.04) 100%)' }}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2 text-sm">
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              className="h-10 w-full rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 text-xs text-foreground outline-none ring-0 backdrop-blur-xl transition placeholder:text-muted-foreground/60 focus:border-violet-500/40 focus:bg-white/[0.08] focus:shadow-[0_0_0_1px_rgba(139,92,246,0.3)]"
            />
          </div>

          <div className="space-y-2 text-sm">
            <label className="text-xs font-medium text-muted-foreground">Target role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-10 w-full rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 text-xs text-foreground outline-none ring-0 backdrop-blur-xl transition focus:border-violet-500/40 focus:bg-white/[0.08] focus:shadow-[0_0_0_1px_rgba(139,92,246,0.3)]"
            >
              {ROLE_DEFINITIONS.map((role) => (
                <option key={role.roleName} value={role.roleName} className="bg-slate-900">
                  {role.roleName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 text-sm">
            <label className="text-xs font-medium text-muted-foreground">Resume (PDF only)</label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragActive(false);
              }}
              onDrop={handleDrop}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-8 text-center text-xs text-muted-foreground backdrop-blur-xl transition",
                "border-white/[0.15] bg-white/[0.03] hover:border-violet-500/40 hover:bg-white/[0.06]",
                dragActive && "border-violet-500/60 bg-white/[0.08] shadow-[inset_0_0_0_1px_rgba(139,92,246,0.2)]",
              )}
              onClick={() => {
                const input = document.getElementById("file-input") as HTMLInputElement | null;
                input?.click();
              }}
            >
              <input
                id="file-input"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
              />
              <p className="text-[0.7rem] font-medium text-slate-100">
                Drag & drop your resume here, or click to browse
              </p>
              <p className="text-[0.65rem] text-slate-400">PDF up to ~5MB</p>
              {file && (
                <p className="mt-1 text-[0.65rem] text-emerald-300">
                  Selected: {file.name}
                </p>
              )}
            </div>
          </div>

          {error && (
            <p className="text-[0.7rem] text-rose-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-400 px-5 text-xs font-medium text-white shadow-lg shadow-violet-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                {isParsing && <span>Parsing resume</span>}
                {isAnalyzing && !isParsing && <span>Analyzing skills</span>}
                <LoadingDots />
              </>
            ) : (
              <span>Generate skill gaps & roadmap</span>
            )}
          </button>
        </form>

        <div className="space-y-4 text-xs text-muted-foreground">
          <div className="rounded-2xl border border-white/[0.1] bg-white/[0.04] p-4 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <p className="mb-1 text-[0.7rem] font-medium text-slate-100">
              What happens after upload?
            </p>
            <ol className="space-y-1.5 text-[0.7rem] text-slate-300">
              <li>1. We extract clean text from your PDF.</li>
              <li>2. AI identifies all technical skills.</li>
              <li>3. We compare them against the selected role template.</li>
              <li>4. A 6-month learning roadmap is generated for you.</li>
            </ol>
          </div>
          <div className="rounded-2xl border border-white/[0.1] bg-white/[0.04] p-4 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <p className="mb-1 text-[0.7rem] font-medium text-slate-100">
              Privacy note
            </p>
            <p className="text-[0.7rem] text-slate-400">
              For this hackathon demo, resumes are used only to compute your roadmap. Configure your
              own OpenAI and MongoDB keys locally to keep data private.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
