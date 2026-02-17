"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { IndianJob } from "@/types/jobs";

export default function JobDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [job, setJob] = useState<IndianJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Job not found");
        if (!cancelled) setJob(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="relative mx-auto max-w-3xl px-4 py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        <p className="mt-4 text-sm text-black/70">Loading job…</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="relative mx-auto max-w-3xl px-4 py-12">
        <p className="text-rose-700">{error ?? "Job not found"}</p>
        <Link href="/jobs" className="mt-4 inline-block text-violet-700 hover:underline">
          ← Back to search
        </Link>
      </div>
    );
  }

  const glass =
    "rounded-2xl border border-white/40 bg-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-2xl";

  return (
    <div className="relative mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/jobs"
        className="mb-6 inline-block text-sm text-black/70 hover:text-black"
      >
        ← Back to search
      </Link>
      <div className={`p-6 ${glass}`}>
        <h1 className="text-2xl font-bold text-black">
          {job.job_title || job.title}
        </h1>
        {job.company ? (
          <p className="mt-2 text-lg text-black/80">{job.company}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {job.location && (
            <span className="rounded-full bg-white/50 px-3 py-1 text-sm font-medium text-black/90 backdrop-blur">
              {job.location}
            </span>
          )}
          {job.job_type && (
            <span className="rounded-full bg-violet-200/80 px-3 py-1 text-sm font-medium text-violet-900">
              {job.job_type}
            </span>
          )}
          {job.experience && (
            <span className="rounded-full bg-white/50 px-3 py-1 text-sm font-medium text-black/90 backdrop-blur">
              {job.experience}
            </span>
          )}
        </div>
        {job.job_description && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-black/60">
              Description
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-black/90">
              {job.job_description}
            </p>
          </div>
        )}
        {job.role_and_responsibility && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-black/60">
              Role &amp; responsibilities
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-black/90">
              {job.role_and_responsibility}
            </p>
          </div>
        )}
        {job.education_and_skills && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-black/60">
              Education &amp; skills
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-black/90">
              {job.education_and_skills}
            </p>
          </div>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          {job.apply_link && (
            <a
              href={job.apply_link}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-violet-600 px-6 py-3 font-medium text-white shadow-lg transition hover:bg-violet-700"
            >
              Apply on company site →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
