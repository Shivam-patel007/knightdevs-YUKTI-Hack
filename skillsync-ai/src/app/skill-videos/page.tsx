"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const STORAGE_KEY_LAST_WATCHED = "skill-videos-last-watched";

type YouTubeVideo = {
  title: string;
  channel: string;
  url: string;
  thumbnail?: string;
  publishedAt?: string;
};

export default function SkillVideosPage() {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastWatched, setLastWatched] = useState<YouTubeVideo | null>(null);

  const loadLastWatched = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LAST_WATCHED);
      if (raw) {
        const parsed = JSON.parse(raw) as YouTubeVideo;
        if (parsed?.url) setLastWatched(parsed);
      }
    } catch {
      setLastWatched(null);
    }
  }, []);

  useEffect(() => {
    loadLastWatched();
  }, [loadLastWatched]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setError(null);
    setLoading(true);
    setVideos([]);
    try {
      const res = await fetch(
        `/api/youtube/search?q=${encodeURIComponent(q)}&max=12`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setVideos(data.videos ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load videos.");
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (video: YouTubeVideo) => {
    try {
      localStorage.setItem(STORAGE_KEY_LAST_WATCHED, JSON.stringify(video));
      setLastWatched(video);
    } catch {
      // ignore
    }
  };

  return (
    <div className="py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Skill video search
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Search for learning videos by skill. Powered by YouTube Data API.
          </p>
        </div>
        <Link
          href="/analyze"
          className="rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground/80 hover:bg-violet-500/5"
        >
          ← Resume analyzer
        </Link>
      </div>

      {/* Last watched */}
      {lastWatched && (
        <div className="mb-6 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Last watched
          </p>
          <a
            href={lastWatched.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleVideoClick(lastWatched)}
            className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-violet-500/30 hover:bg-violet-500/10 sm:flex-nowrap"
          >
            {lastWatched.thumbnail && (
              <img
                src={lastWatched.thumbnail}
                alt=""
                className="h-20 w-36 shrink-0 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {lastWatched.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {lastWatched.channel}
              </p>
            </div>
            <span className="shrink-0 text-xs text-violet-300">Open →</span>
          </a>
        </div>
      )}

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. React, TypeScript, Python"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-violet-500/40 focus:outline-none focus:ring-1 focus:ring-violet-500/30 sm:max-w-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-600 disabled:opacity-50"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {videos.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {videos.length} video{videos.length !== 1 ? "s" : ""} found
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video, i) => (
            <a
              key={`${video.url}-${i}`}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleVideoClick(video)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-violet-500/30 hover:bg-violet-500/10"
            >
              <div className="aspect-video w-full shrink-0 bg-slate-800">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt=""
                    className="h-full w-full object-cover transition group-hover:brightness-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-500">
                    ▶
                  </div>
                )}
              </div>
              <div className="flex min-h-0 flex-1 flex-col p-3">
                <p className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-violet-200">
                  {video.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {video.channel}
                </p>
                <span className="mt-2 text-xs text-violet-400">Watch on YouTube →</span>
              </div>
            </a>
          ))}
        </div>
        {!loading && videos.length === 0 && query.trim() && !error && (
          <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-muted-foreground">
            No videos found. Try another skill name.
          </p>
        )}
      </div>
    </div>
  );
}
