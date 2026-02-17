export * from "./schemas";

export type Role = {
  id: string;
  name: string;
  description?: string;
  requiredSkills: string[];
};

export type YouTubeResource = {
  title: string;
  channel: string;
  url: string;
  thumbnail?: string;
  publishedAt?: string;
};
