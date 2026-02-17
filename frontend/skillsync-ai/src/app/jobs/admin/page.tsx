"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { jobsFetch, getJobPortalToken, clearJobPortalToken } from "@/lib/jobs-api";

type Stats = {
  totalUsers: number;
  totalApplications: number;
  recentApplications: Array<{
    _id: string;
    jobId: string;
    status: string;
    createdAt: string;
    userId?: { name?: string; email?: string };
  }>;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getJobPortalToken();
    if (!token) {
      router.push("/jobs");
      return;
    }
    jobsFetch("/api/jobs/admin/stats")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Forbidden");
        setStats(data);
      })
      .catch((err) => {
        setError(err.message ?? "Failed to load");
        if (err.message?.includes("403")) router.push("/jobs");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    clearJobPortalToken();
    router.push("/jobs");
  };

  const glass =
    "rounded-2xl border border-white/40 bg-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-2xl";
  const glassBtn =
    "rounded-xl border border-white/40 bg-white/25 px-4 py-2 text-sm font-medium text-black shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-2xl transition hover:bg-white/40";

  if (loading) {
    return (
      <div className="relative mx-auto max-w-4xl px-4 py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="relative mx-auto max-w-4xl px-4 py-12">
        <p className="text-rose-700">{error}</p>
        <Link href="/jobs" className="mt-4 inline-block font-medium text-violet-700 hover:underline">
          ← Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-black">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/jobs" className={glassBtn}>
            Jobs
          </Link>
          <button onClick={handleLogout} className={glassBtn}>
            Log out
          </button>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className={`p-6 ${glass}`}>
          <p className="text-sm font-medium text-black/60">Total users</p>
          <p className="mt-1 text-3xl font-bold text-black">
            {stats?.totalUsers ?? 0}
          </p>
        </div>
        <div className={`p-6 ${glass}`}>
          <p className="text-sm font-medium text-black/60">Total applications</p>
          <p className="mt-1 text-3xl font-bold text-black">
            {stats?.totalApplications ?? 0}
          </p>
        </div>
      </div>

      <section className={`p-6 ${glass}`}>
        <h2 className="text-lg font-semibold text-black">Recent applications</h2>
        <ul className="mt-4 space-y-2">
          {(stats?.recentApplications ?? []).length === 0 ? (
            <li className="text-black/60">No applications yet.</li>
          ) : (
            (stats?.recentApplications ?? []).map((app) => (
              <li
                key={app._id}
                className="flex items-center justify-between rounded-xl bg-white/40 px-4 py-3 backdrop-blur border border-white/30"
              >
                <div>
                  <span className="font-medium text-black">Job #{app.jobId}</span>
                  {app.userId && (
                    <span className="ml-2 text-black/60">
                      by {(app.userId as { name?: string }).name ?? (app.userId as { email?: string }).email}
                    </span>
                  )}
                </div>
                <span className="text-sm text-black/60">{app.status}</span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
