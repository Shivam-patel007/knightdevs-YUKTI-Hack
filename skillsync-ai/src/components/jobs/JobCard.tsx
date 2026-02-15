import Link from "next/link";
import type { IndianJob } from "@/types/jobs";

export function JobCard({ job }: { job: IndianJob }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group block rounded-2xl border border-white/40 bg-white/25 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-2xl transition hover:border-violet-300/50 hover:bg-white/35"
    >
      <h3 className="line-clamp-2 font-semibold text-black group-hover:text-violet-800">
        {job.job_title || job.title}
      </h3>
      <p className="mt-1 text-sm text-black/80">{job.company}</p>
      {job.location && (
        <p className="mt-1 text-xs text-black/60">{job.location}</p>
      )}
      {job.job_type && (
        <span className="mt-2 inline-block rounded-full bg-violet-200/80 px-2 py-0.5 text-xs font-medium text-violet-900">
          {job.job_type}
        </span>
      )}
    </Link>
  );
}
