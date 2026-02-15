"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { setJobPortalToken } from "@/lib/jobs-api";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/jobs/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/jobs/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      setJobPortalToken(data.token);
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-white/40 bg-white/25 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-2xl">
        <h1 className="text-2xl font-bold text-black">Log in</h1>
        <p className="mt-1 text-sm text-black/60">Job Portal</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-black/80">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-white/40 bg-white/30 px-4 py-3 text-black placeholder-black/50 backdrop-blur-xl focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black/80">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-white/40 bg-white/30 px-4 py-3 text-black placeholder-black/50 backdrop-blur-xl focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
          </div>
          {error && (
            <p className="text-sm text-rose-700">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 py-3 font-medium text-white shadow-lg transition hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-black/60">
          Don&apos;t have an account?{" "}
          <Link href="/jobs/register" className="text-violet-700 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
