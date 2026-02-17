/**
 * ATS Resume Matcher - Skill extraction helper
 * Extracts and normalizes technical skills from text (JD or resume).
 */

/** Canonical list of technical skills used for matching (lowercase). */
const skillList = [
  "react",
  "reactjs",
  "node.js",
  "nodejs",
  "express",
  "mongodb",
  "mysql",
  "postgresql",
  "javascript",
  "typescript",
  "python",
  "java",
  "c++",
  "aws",
  "docker",
  "kubernetes",
  "git",
  "github",
  "rest api",
  "next.js",
  "html",
  "css",
  "tailwind"
];

/**
 * Map variant spellings to a single canonical form for deduplication.
 * e.g. "nodejs" and "node.js" both become "node.js"
 */
const canonicalSkillMap = {
  nodejs: "node.js",
  reactjs: "react",
  "react.js": "react",
};

/**
 * Get canonical form of a skill for consistent output.
 * @param {string} skill - Lowercase skill string
 * @returns {string} Canonical skill string
 */
function toCanonical(skill) {
  return canonicalSkillMap[skill] || skill;
}

/**
 * Extract unique technical skills from text.
 * - Converts text to lowercase
 * - Normalizes common variations (e.g. nodejs → node.js, reactjs → react)
 * - Returns only skills that appear in skillList, in canonical form, no duplicates
 *
 * @param {string} text - Raw text (job description or resume body)
 * @returns {string[]} Sorted array of unique matched skills (canonical form)
 */
function extractSkills(text) {
  if (!text || typeof text !== "string") return [];

  let normalized = text.toLowerCase().trim();
  // Normalize common variations in the text so we match correctly
  normalized = normalized.replace(/\bnodejs\b/g, "node.js");
  normalized = normalized.replace(/\breactjs\b/g, "react");
  normalized = normalized.replace(/\breact\.js\b/g, "react");

  const found = new Set();
  // Match longer phrases first to avoid "java" matching inside "javascript"
  const byLength = [...skillList].sort((a, b) => b.length - a.length);

  for (const skill of byLength) {
    if (normalized.includes(skill)) {
      found.add(toCanonical(skill));
    }
  }

  return [...found].sort();
}

module.exports = {
  skillList,
  extractSkills,
};
