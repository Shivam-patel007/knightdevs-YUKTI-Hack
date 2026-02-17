import type { SkillGapResult } from "@/types/schemas";

function normalizeSkill(s: string): string {
  return s.trim().toLowerCase();
}

/**
 * Compare user skills vs required role skills
 */
export function computeSkillGap(
  userSkills: string[],
  requiredSkills: string[]
): SkillGapResult {
  const normalizedUser = new Set(userSkills.map(normalizeSkill));

  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of requiredSkills) {
    const n = normalizeSkill(skill);
    if (normalizedUser.has(n)) matched.push(skill);
    else missing.push(skill);
  }

  const skill_match_percentage =
    requiredSkills.length === 0
      ? 0
      : Math.round((matched.length / requiredSkills.length) * 100);

  return {
    matched_skills: matched,
    missing_skills: missing,
    skill_match_percentage,
  };
}

/**
 * Merge technical_skills, tools, and partial soft_skills for comparison
 */
export function getAllUserSkills(extracted: {
  technical_skills: string[];
  soft_skills?: string[];
  tools?: string[];
}): string[] {
  const all = [
    ...(extracted.technical_skills || []),
    ...(extracted.tools || []),
    ...(extracted.soft_skills || []).slice(0, 5), // partial soft skills
  ];
  return [...new Set(all.map((s) => s.trim()).filter(Boolean))];
}
