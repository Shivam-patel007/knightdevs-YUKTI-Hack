export type SkillComparisonResult = {
  matchedSkills: string[];
  missingSkills: string[];
  matchScore: number;
};

export function normalizeSkill(skill: string): string {
  return skill.trim().toLowerCase();
}

export function compareSkills(
  userSkills: string[],
  requiredSkills: string[],
): SkillComparisonResult {
  const normalizedUser = new Set(userSkills.map(normalizeSkill));

  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of requiredSkills) {
    const normalized = normalizeSkill(skill);
    if (normalizedUser.has(normalized)) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  }

  const matchScore =
    requiredSkills.length === 0
      ? 0
      : Math.round((matched.length / requiredSkills.length) * 100);

  return {
    matchedSkills: matched,
    missingSkills: missing,
    matchScore,
  };
}
