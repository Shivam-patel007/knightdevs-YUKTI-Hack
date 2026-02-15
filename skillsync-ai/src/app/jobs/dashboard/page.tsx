"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { jobsFetch, getJobPortalToken, clearJobPortalToken } from "@/lib/jobs-api";

type Application = {
  _id: string;
  jobId: string;
  jobSnapshot?: { title?: string; company?: string; location?: string };
  resumeUrl?: string;
  status: string;
  createdAt: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const token = getJobPortalToken();
    if (!token) {
      router.push("/jobs/login?redirect=/jobs/dashboard");
      return;
    }
    (async () => {
      try {
        const [appRes, savedRes] = await Promise.all([
          jobsFetch("/api/jobs/applications"),
          jobsFetch("/api/jobs/saved"),
        ]);
        const appData = await appRes.json();
        const savedData = await savedRes.json();
        if (appRes.ok) setApplications(appData.applications ?? []);
        if (savedRes.ok) setSavedJobIds(savedData.savedJobIds ?? []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleLogout = () => {
    clearJobPortalToken();
    router.push("/jobs");
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await jobsFetch("/api/jobs/resume", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResumeUrl(data.resumeUrl);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
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

  return (
    <div className="relative mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-black">My Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/jobs" className={glassBtn}>
            Search jobs
          </Link>
          <button onClick={handleLogout} className={glassBtn}>
            Log out
          </button>
        </div>
      </div>

      <section className={`mb-8 p-6 ${glass}`}>
        <h2 className="text-lg font-semibold text-black">Resume</h2>
        <p className="mt-1 text-sm text-black/60">
          Upload a PDF resume to attach to applications.
        </p>
        <label className="mt-3 inline-block cursor-pointer rounded-xl bg-violet-200/80 px-4 py-2 text-sm font-medium text-violet-900 transition hover:bg-violet-300/80">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleResumeUpload}
            disabled={uploading}
            className="hidden"
          />
          {uploading ? "Uploading…" : "Upload PDF"}
        </label>
        {resumeUrl && (
          <p className="mt-2 text-sm text-emerald-800">
            Resume saved: <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="underline">{resumeUrl}</a>
          </p>
        )}
      </section>

      <section className={`mb-8 p-6 ${glass}`}>
        <h2 className="text-lg font-semibold text-black">Applied jobs</h2>
        <p className="mt-1 text-sm text-black/60">
          {applications.length} application{applications.length !== 1 ? "s" : ""}
        </p>
        <ul className="mt-4 space-y-2">
          {applications.length === 0 ? (
            <li className="text-black/60">No applications yet.</li>
          ) : (
            applications.map((app) => (
              <li key={app._id} className="flex items-center justify-between rounded-xl bg-white/40 px-4 py-3 backdrop-blur border border-white/30">
                <div>
                  <span className="font-medium text-black">
                    {app.jobSnapshot?.title ?? app.jobId}
                  </span>
                  {app.jobSnapshot?.company && (
                    <span className="ml-2 text-black/60">
                      @ {app.jobSnapshot.company}
                    </span>
                  )}
                </div>
                <Link
                  href={`/jobs/${app.jobId}`}
                  className="text-sm font-medium text-violet-700 hover:underline"
                >
                  View job
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className={`p-6 ${glass}`}>
        <h2 className="text-lg font-semibold text-black">Saved jobs</h2>
        <p className="mt-1 text-sm text-black/60">
          {savedJobIds.length} saved job{savedJobIds.length !== 1 ? "s" : ""}
        </p>
        <ul className="mt-4 space-y-2">
          {savedJobIds.length === 0 ? (
            <li className="text-black/60">No saved jobs.</li>
          ) : (
            savedJobIds.map((jobId) => (
              <li key={jobId} className="flex items-center justify-between rounded-xl bg-white/40 px-4 py-3 backdrop-blur border border-white/30">
                <span className="font-medium text-black">Job #{jobId}</span>
                <Link
                  href={`/jobs/${jobId}`}
                  className="text-sm font-medium text-violet-700 hover:underline"
                >
                  View
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
