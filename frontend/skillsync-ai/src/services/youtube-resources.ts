/**
 * YouTube Data API v3 - search with "Learn {skill} full course"
 */

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export type YouTubeVideo = { title: string; url: string };

export async function fetchYouTubeForSkill(
  skill: string,
  maxResults = 3
): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  const q = encodeURIComponent(`Learn ${skill} full course`);
  const url = `${YOUTUBE_API_BASE}/search?part=snippet&q=${q}&type=video&maxResults=${maxResults}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`YouTube API ${res.status}`);

    const data = (await res.json()) as {
      items?: {
        id: { videoId?: string };
        snippet: { title: string };
      }[];
    };

    return (data.items || [])
      .filter((item) => item.id?.videoId)
      .map((item) => ({
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      }));
  } catch (err) {
    console.error("YouTube API error:", err);
    return [];
  }
}
