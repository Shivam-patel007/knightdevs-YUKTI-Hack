import type { YouTubeResource } from "@/types";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

/**
 * Fetch YouTube videos for a skill via YouTube Data API v3
 */
export async function searchYouTubeForSkill(
  skill: string,
  maxResults = 5
): Promise<YouTubeResource[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return []; // Graceful fallback if no key
  }

  const q = encodeURIComponent(`${skill} tutorial programming`);
  const url = `${YOUTUBE_API_BASE}/search?part=snippet&q=${q}&type=video&maxResults=${maxResults}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`YouTube API ${res.status}`);

    const data = (await res.json()) as {
      items?: {
        id: { videoId: string };
        snippet: {
          title: string;
          channelTitle: string;
          publishedAt?: string;
          thumbnails?: { default?: { url?: string } };
        };
      }[];
    };

    return (data.items || []).map((item) => ({
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail:
        (item.snippet.thumbnails as { medium?: { url?: string }; default?: { url?: string } })
          ?.medium?.url ?? item.snippet.thumbnails?.default?.url,
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (err) {
    console.error("YouTube API error:", err);
    return [];
  }
}

/**
 * Fetch YouTube resources for multiple missing skills
 */
export async function getYouTubeResourcesForSkills(
  skills: string[]
): Promise<{ skill: string; videos: YouTubeResource[] }[]> {
  const results = await Promise.all(
    skills.map(async (skill) => ({
      skill,
      videos: await searchYouTubeForSkill(skill, 4),
    }))
  );
  return results;
}
