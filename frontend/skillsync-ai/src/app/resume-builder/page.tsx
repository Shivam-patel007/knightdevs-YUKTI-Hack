"use client";

import Link from "next/link";
import { useState } from "react";

export default function ResumeBuilderPage() {
  const [loadFailed, setLoadFailed] = useState(false);

  return (
    <div className="fixed inset-0 z-30 flex h-screen w-screen flex-col bg-background">
      {loadFailed ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12">
          <div className="max-w-md rounded-2xl border border-border/50 bg-card px-8 py-10 text-center shadow-lg">
            <h2 className="text-lg font-semibold text-foreground">
              Resume builder failed to load
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Build and copy the resume app into this project so the preview can load.
            </p>
            <p className="mt-4 rounded-lg bg-muted/50 px-4 py-3 font-mono text-xs text-foreground">
              From project root: npm run build:embed
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Or from <code className="rounded bg-muted px-1">skillsync-ai/resume-builder</code>: npm run build:embed
            </p>
            <a
              href="/resume-builder/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block rounded-xl border border-violet-500/50 bg-violet-500/10 px-5 py-2.5 text-sm font-medium text-violet-200 transition hover:bg-violet-500/20"
            >
              Open in new tab
            </a>
          </div>
        </div>
      ) : (
        <iframe
          title="AI Resume Builder"
          src="/resume-builder/index.html"
          className="h-full w-full flex-1 border-0"
          onError={() => setLoadFailed(true)}
        />
      )}
      <Link
        href="/"
        className="absolute left-4 top-4 z-40 rounded-full border border-white/20 bg-black/40 px-3 py-2 text-xs font-medium text-white backdrop-blur-md transition hover:bg-violet-500/30 hover:text-white"
      >
        ← Back to SkillSync
      </Link>
    </div>
  );
}
