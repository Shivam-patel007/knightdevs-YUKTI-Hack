import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-[70vh] flex-col justify-center gap-10 py-10">
      <header className="flex items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-sky-400 shadow-lg shadow-violet-900/40" />
          <div className="flex flex-col">
            <span className="text-sm font-medium tracking-tight text-muted-foreground">
              SkillSyncAI
            </span>
            <span className="text-xs text-muted-foreground/70">
              AI Job & Skill Navigator
            </span>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link
            href="/upload"
            className="rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-md transition hover:border-violet-500/70 hover:bg-violet-500/5 hover:text-foreground"
          >
            Upload Resume
          </Link>
          <Link
            href="/analyze"
            className="rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-md transition hover:border-violet-500/70 hover:bg-violet-500/5 hover:text-foreground"
          >
            Resume Analyzer
          </Link>
          <Link
            href="/resume-builder"
            className="rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-md transition hover:border-violet-500/70 hover:bg-violet-500/5 hover:text-foreground"
          >
            Resume Builder
          </Link>
          <Link
            href="/skill-videos"
            className="rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-md transition hover:border-violet-500/70 hover:bg-violet-500/5 hover:text-foreground"
          >
            Skill videos
          </Link>
          <Link
            href="/jobs"
            className="rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-md transition hover:border-violet-500/70 hover:bg-violet-500/5 hover:text-foreground"
          >
            Job Portal
          </Link>
          <Link
            href="/ats-match"
            className="rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-md transition hover:border-violet-500/70 hover:bg-violet-500/5 hover:text-foreground"
          >
            ATS Matcher
          </Link>
          <Link
            href="/roadmap-from-jd"
            className="rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-md transition hover:border-violet-500/70 hover:bg-violet-500/5 hover:text-foreground"
          >
            Roadmap from JD
          </Link>
          <Link
            href="/resume-validation"
            className="rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-md transition hover:border-violet-500/70 hover:bg-violet-500/5 hover:text-foreground"
          >
            Resume Validation
          </Link>
          <Link
            href="/interview-from-jd"
            className="rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur-md transition hover:border-violet-500/70 hover:bg-violet-500/5 hover:text-foreground"
          >
            Interview Qs from JD
          </Link>
        </nav>
      </header>

      <section className="grid gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-center">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-100 shadow-sm shadow-violet-900/40 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>AI-powered career intelligence for students</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Navigate from resume to roadmap
            </h1>
            <p className="max-w-xl text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
              Upload your resume, pick a target role, and let AI surface your skills, gaps, and a
              personalised 6‑month learning plan. Designed for students who want a clear path into
              modern tech careers.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-sky-400 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-900/40 transition hover:brightness-110"
            >
              Get started – upload resume
            </Link>
            <p className="text-xs text-muted-foreground">
              No sign-up required for demo. PDF only.
            </p>
          </div>
          <dl className="grid gap-4 text-xs text-muted-foreground sm:grid-cols-3">
            <div className="rounded-xl border border-border/40 bg-background/40 px-4 py-3 backdrop-blur">
              <dt className="text-[0.7rem] uppercase tracking-wide text-muted-foreground/70">
                Skill intelligence
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                AI-extracted skills from your resume
              </dd>
            </div>
            <div className="rounded-xl border border-border/40 bg-background/40 px-4 py-3 backdrop-blur">
              <dt className="text-[0.7rem] uppercase tracking-wide text-muted-foreground/70">
                Gap analysis
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                Compare against job-ready role templates
              </dd>
            </div>
            <div className="rounded-xl border border-border/40 bg-background/40 px-4 py-3 backdrop-blur">
              <dt className="text-[0.7rem] uppercase tracking-wide text-muted-foreground/70">
                Roadmap
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                Structured 6‑month learning journey
              </dd>
            </div>
          </dl>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-violet-400/30 via-sky-300/20 to-emerald-400/20 opacity-80 blur-2xl" />
          <div className="relative rounded-3xl border border-white/40 bg-white/25 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-2xl">
            <div className="mb-4 flex items-center justify-between text-xs text-black/70">
              <span className="text-[0.7rem] font-medium uppercase tracking-wide">Preview</span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[0.7rem] font-medium text-black">
                Resume → Skills → Roadmap
              </span>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-[auto,1fr,auto] items-center gap-2 rounded-2xl bg-white/40 px-3 py-2 backdrop-blur-xl border border-white/30">
                <div className="h-6 w-6 rounded-xl bg-black/10" />
                <div>
                  <p className="text-[0.7rem] font-semibold text-black">Frontend Developer</p>
                  <p className="text-[0.65rem] text-black/60">React • TypeScript • Tailwind • Git</p>
                </div>
                <span className="text-[0.7rem] font-semibold text-emerald-700">82%</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/40 p-3 backdrop-blur-xl border border-white/30">
                  <p className="mb-1 text-[0.7rem] font-semibold text-black">Your skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-black/10 px-2 py-0.5 text-[0.65rem] font-medium text-black">
                      React
                    </span>
                    <span className="rounded-full bg-black/10 px-2 py-0.5 text-[0.65rem] font-medium text-black">
                      JavaScript
                    </span>
                    <span className="rounded-full bg-black/10 px-2 py-0.5 text-[0.65rem] font-medium text-black">
                      HTML/CSS
                    </span>
                    <span className="rounded-full bg-black/10 px-2 py-0.5 text-[0.65rem] font-medium text-black">
                      Git
                    </span>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/40 p-3 backdrop-blur-xl border border-white/30">
                  <p className="mb-1 text-[0.7rem] font-semibold text-black">Missing skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-rose-200/80 px-2 py-0.5 text-[0.65rem] font-medium text-black">
                      TypeScript
                    </span>
                    <span className="rounded-full bg-rose-200/80 px-2 py-0.5 text-[0.65rem] font-medium text-black">
                      Testing (Jest)
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white/40 p-3 backdrop-blur-xl border border-white/30">
                <p className="mb-2 text-[0.7rem] font-semibold text-black">
                  6‑month roadmap snapshot
                </p>
                <ul className="space-y-1.5 text-[0.65rem] text-black/70">
                  <li>Month 1–2: Modern JavaScript & TypeScript foundations</li>
                  <li>Month 3–4: React ecosystem, state management, UI patterns</li>
                  <li>Month 5–6: Real-world projects, testing, deployment</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section – all main product features */}
      <section className="border-t border-border/40 pt-12">
        <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight text-foreground">
          Everything you need to level up
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/upload"
            className="group rounded-2xl border border-border/40 bg-background/40 p-5 backdrop-blur transition hover:border-violet-500/50 hover:bg-violet-500/5"
          >
            <div className="mb-3 h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/80 to-violet-600/80 shadow-sm" />
            <h3 className="mb-1.5 font-medium text-foreground group-hover:text-violet-400">
              Upload & Roadmap
            </h3>
            <p className="text-xs text-muted-foreground">
              Upload your resume and get a personalised 6‑month learning plan and skill gap analysis.
            </p>
          </Link>
          <Link
            href="/analyze"
            className="group rounded-2xl border border-border/40 bg-background/40 p-5 backdrop-blur transition hover:border-violet-500/50 hover:bg-violet-500/5"
          >
            <div className="mb-3 h-10 w-10 rounded-xl bg-gradient-to-br from-fuchsia-500/80 to-fuchsia-600/80 shadow-sm" />
            <h3 className="mb-1.5 font-medium text-foreground group-hover:text-violet-400">
              Resume Analyzer
            </h3>
            <p className="text-xs text-muted-foreground">
              Get AI-powered resume critique and ATS-friendly suggestions to improve your narrative.
            </p>
          </Link>
          <Link
            href="/resume-builder"
            className="group rounded-2xl border border-border/40 bg-background/40 p-5 backdrop-blur transition hover:border-violet-500/50 hover:bg-violet-500/5"
          >
            <div className="mb-3 h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500/80 to-sky-600/80 shadow-sm" />
            <h3 className="mb-1.5 font-medium text-foreground group-hover:text-violet-400">
              Resume Builder
            </h3>
            <p className="text-xs text-muted-foreground">
              Create and export a professional resume with templates and easy editing.
            </p>
          </Link>
          <Link
            href="/skill-videos"
            className="group rounded-2xl border border-border/40 bg-background/40 p-5 backdrop-blur transition hover:border-violet-500/50 hover:bg-violet-500/5"
          >
            <div className="mb-3 h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500/80 to-rose-600/80 shadow-sm" />
            <h3 className="mb-1.5 font-medium text-foreground group-hover:text-violet-400">
              Skill Videos
            </h3>
            <p className="text-xs text-muted-foreground">
              Curated video recommendations to learn the skills you need for your target role.
            </p>
          </Link>
          <Link
            href="/jobs"
            className="group rounded-2xl border border-border/40 bg-background/40 p-5 backdrop-blur transition hover:border-violet-500/50 hover:bg-violet-500/5"
          >
            <div className="mb-3 h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/80 to-emerald-600/80 shadow-sm" />
            <h3 className="mb-1.5 font-medium text-foreground group-hover:text-violet-400">
              Job Portal
            </h3>
            <p className="text-xs text-muted-foreground">
              Search and apply for jobs matched to your skills and target role.
            </p>
          </Link>
          <Link
            href="/ats-match"
            className="group rounded-2xl border border-border/40 bg-background/40 p-5 backdrop-blur transition hover:border-violet-500/50 hover:bg-violet-500/5"
          >
            <div className="mb-3 h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/80 to-orange-500/80 shadow-sm" />
            <h3 className="mb-1.5 font-medium text-foreground group-hover:text-violet-400">
              ATS Resume Matcher
            </h3>
            <p className="text-xs text-muted-foreground">
              Match your resume to any job description and see your ATS score, missing skills, and suggestions.
            </p>
          </Link>
          <Link
            href="/roadmap-from-jd"
            className="group rounded-2xl border border-border/40 bg-background/40 p-5 backdrop-blur transition hover:border-violet-500/50 hover:bg-violet-500/5"
          >
            <div className="mb-3 h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/80 to-violet-500/80 shadow-sm" />
            <h3 className="mb-1.5 font-medium text-foreground group-hover:text-violet-400">
              Roadmap from JD
            </h3>
            <p className="text-xs text-muted-foreground">
              Generate a structured learning roadmap from a target job description using AI (OpenRouter).
            </p>
          </Link>
          <Link
            href="/resume-validation"
            className="group rounded-2xl border border-border/40 bg-background/40 p-5 backdrop-blur transition hover:border-violet-500/50 hover:bg-violet-500/5"
          >
            <div className="mb-3 h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500/80 to-cyan-500/80 shadow-sm" />
            <h3 className="mb-1.5 font-medium text-foreground group-hover:text-violet-400">
              Resume Validation
            </h3>
            <p className="text-xs text-muted-foreground">
              Prove ATS scoring: match your resume against 3 fixed jobs and see score and missing skills per role.
            </p>
          </Link>
          <Link
            href="/interview-from-jd"
            className="group rounded-2xl border border-border/40 bg-background/40 p-5 backdrop-blur transition hover:border-violet-500/50 hover:bg-violet-500/5"
          >
            <div className="mb-3 h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/80 to-sky-500/80 shadow-sm" />
            <h3 className="mb-1.5 font-medium text-foreground group-hover:text-violet-400">
              Interview Qs from JD
            </h3>
            <p className="text-xs text-muted-foreground">
              Generate tailored interview preparation questions directly from a job description using AI.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
