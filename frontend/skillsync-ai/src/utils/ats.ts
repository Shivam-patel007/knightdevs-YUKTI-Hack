import { RoleDefinition } from "@/lib/roles";

export type AtsResult = {
  score: number;
  notes: string[];
};

export function computeAtsScore(
  resumeText: string,
  userSkills: string[],
  role: RoleDefinition,
): AtsResult {
  const text = resumeText.toLowerCase();
  const notes: string[] = [];

  let score = 50; // base

  const hasSections =
    /experience|projects|education|skills|summary|objective/i.test(resumeText);
  if (hasSections) {
    score += 10;
    notes.push("Good use of standard sections (experience, projects, skills, etc.)");
  } else {
    notes.push("Add clear sections like Experience, Projects, Skills, Education.");
  }

  const keywordHits = role.requiredSkills.filter((skill) =>
    text.includes(skill.toLowerCase()),
  ).length;

  const keywordRatio = keywordHits / Math.max(role.requiredSkills.length, 1);
  score += Math.round(keywordRatio * 30);

  if (keywordRatio < 0.4) {
    notes.push("Include more of the target role keywords in your bullet points.");
  } else {
    notes.push("Good coverage of target role keywords.");
  }

  const bulletLike = /•|-\s+|\d+\./.test(resumeText);
  if (bulletLike) {
    score += 5;
    notes.push("Uses bullet-style structure, which ATS systems parse better.");
  } else {
    notes.push("Use concise bullet points instead of long paragraphs.");
  }

  score = Math.min(100, Math.max(0, score));

  return { score, notes };
}

export type IndustryDemand = {
  level: "Low" | "Medium" | "High" | "Very High";
  index: number;
  summary: string;
};

export const INDUSTRY_DEMAND_BY_ROLE: Record<string, IndustryDemand> = {
  "Full Stack Developer": {
    level: "Very High",
    index: 88,
    summary: "High demand for developers who can build end-to-end web applications.",
  },
  "Frontend Developer": {
    level: "High",
    index: 82,
    summary:
      "Strong demand for modern frontend engineers with React/Next.js and design-system skills.",
  },
  "Backend Developer": {
    level: "High",
    index: 79,
    summary:
      "Consistent hiring for backend engineers who can design APIs, work with databases, and deploy services.",
  },
  "Data Scientist": {
    level: "Very High",
    index: 85,
    summary: "Strong demand for data scientists in analytics, ML, and AI roles.",
  },
  "Data Analyst": {
    level: "Medium",
    index: 68,
    summary:
      "Healthy demand, especially in product & growth teams; strong SQL and storytelling skills stand out.",
  },
  "AI Engineer": {
    level: "Very High",
    index: 90,
    summary:
      "Explosive demand for applied AI engineers who can build and ship LLM-powered products.",
  },
  "Cyber Security": {
    level: "High",
    index: 85,
    summary:
      "Security roles remain critical as more systems move online and compliance requirements grow.",
  },
};

export function getIndustryDemand(roleName: string): IndustryDemand | null {
  return INDUSTRY_DEMAND_BY_ROLE[roleName] ?? null;
}
