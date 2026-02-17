import type { AtsResult } from "@/types/schemas";

type RoleDef = { requiredSkills: string[] };

/**
 * Compute ATS score (0-100) and improvement suggestions
 */
export function computeAtsScore(
  resumeText: string,
  userSkills: string[],
  role: RoleDef
): AtsResult {
  const text = resumeText.toLowerCase();
  const notes: string[] = [];

  let score = 40; // base

  // Section structure
  const hasSections = /experience|projects|education|skills|summary|objective/i.test(resumeText);
  if (hasSections) {
    score += 15;
    notes.push("Good use of standard sections (Experience, Projects, Skills).");
  } else {
    notes.push("Add clear sections: Experience, Projects, Skills, Education.");
  }

  // Keyword match
  const keywordHits = role.requiredSkills.filter((s) =>
    text.includes(s.toLowerCase())
  ).length;
  const keywordRatio = keywordHits / Math.max(role.requiredSkills.length, 1);
  score += Math.round(keywordRatio * 30);
  if (keywordRatio < 0.4) {
    notes.push("Include more target role keywords in bullet points.");
  } else {
    notes.push("Good keyword coverage for the role.");
  }

  // Bullet structure
  if (/•|-\s+|\d+\./.test(resumeText)) {
    score += 10;
    notes.push("Uses bullet points—ATS parses these well.");
  } else {
    notes.push("Use concise bullet points instead of paragraphs.");
  }

  // Length
  if (resumeText.length > 500) score += 5;

  return {
    score: Math.min(100, Math.max(0, score)),
    notes,
  };
}
