import { z } from "zod";

// AI Skill Extraction response
export const ExtractedSkillsSchema = z.object({
  technical_skills: z.array(z.string()),
  soft_skills: z.array(z.string()),
  tools: z.array(z.string()),
  experience_level: z.string(),
});

export type ExtractedSkills = z.infer<typeof ExtractedSkillsSchema>;

// Roadmap month structure
export const RoadmapMonthSchema = z.object({
  month: z.number(),
  focus: z.string(),
  tasks: z.array(z.string()),
  project: z.string(),
});

export type RoadmapMonth = z.infer<typeof RoadmapMonthSchema>;

// Alternative roadmap format (existing)
export const RoadmapMonthAltSchema = z.object({
  month: z.number(),
  focusSkills: z.array(z.string()),
  recommendedProjects: z.array(z.string()),
  weeklyGoals: z.string(),
  estimatedHoursPerWeek: z.number(),
});

export const RoadmapResponseSchema = z.object({
  months: z.array(RoadmapMonthAltSchema),
});

export type RoadmapResponse = z.infer<typeof RoadmapResponseSchema>;

// Skill gap result
export const SkillGapResultSchema = z.object({
  matched_skills: z.array(z.string()),
  missing_skills: z.array(z.string()),
  skill_match_percentage: z.number(),
});

export type SkillGapResult = z.infer<typeof SkillGapResultSchema>;

// ATS result
export const AtsResultSchema = z.object({
  score: z.number().min(0).max(100),
  notes: z.array(z.string()),
});

export type AtsResult = z.infer<typeof AtsResultSchema>;
