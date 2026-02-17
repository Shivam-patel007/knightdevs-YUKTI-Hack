export type RoadmapItem = {
  skill: string;
  beginner_steps: string[];
  intermediate_steps: string[];
  advanced_steps: string[];
  youtube_resources?: { title: string; url: string }[];
};

export type ResumeAnalyzerResponse = {
  matched_skills: string[];
  missing_skills: string[];
  skill_gap_percentage: string;
  roadmap: RoadmapItem[];
};
