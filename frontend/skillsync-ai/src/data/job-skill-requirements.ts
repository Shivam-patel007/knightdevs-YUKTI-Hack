/**
 * Predefined skill requirements per job role.
 * Used by Resume Analyzer to compare resume skills against target role.
 * Extend this map to add more roles; keep skill names consistent for AI matching.
 */
export const JOB_SKILL_REQUIREMENTS: Record<string, string[]> = {
  "Frontend Developer": [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "TypeScript",
    "Responsive Design",
    "Git",
    "REST APIs",
  ],
  "Backend Developer": [
    "Node.js",
    "Python",
    "Java",
    "REST APIs",
    "SQL",
    "Database Design",
    "Git",
    "Authentication",
  ],
  "Full Stack Developer": [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "SQL",
    "REST APIs",
    "Git",
    "HTML",
    "CSS",
  ],
  "Data Scientist": [
    "Python",
    "Statistics",
    "Machine Learning",
    "SQL",
    "Data Visualization",
    "Pandas",
    "NumPy",
    "Jupyter",
  ],
  "DevOps Engineer": [
    "Linux",
    "Docker",
    "Kubernetes",
    "CI/CD",
    "AWS",
    "Scripting",
    "Git",
    "Monitoring",
  ],
  "Mobile Developer": [
    "React Native",
    "Swift",
    "Kotlin",
    "REST APIs",
    "Git",
    "UI/UX",
  ],
  "Software Engineer": [
    "Data Structures",
    "Algorithms",
    "OOP",
    "Git",
    "SQL",
    "REST APIs",
    "Testing",
  ],
  "ML Engineer": [
    "Python",
    "Machine Learning",
    "Deep Learning",
    "TensorFlow",
    "PyTorch",
    "SQL",
    "MLOps",
  ],
};

export type JobRoleKey = keyof typeof JOB_SKILL_REQUIREMENTS;

export function getRequiredSkillsForRole(role: string): string[] {
  const normalized = role.trim();
  const exact = JOB_SKILL_REQUIREMENTS[normalized];
  if (exact?.length) return [...exact];
  // Fallback: first role that includes the given string (e.g. "Frontend" -> Frontend Developer)
  const key = Object.keys(JOB_SKILL_REQUIREMENTS).find((k) =>
    k.toLowerCase().includes(normalized.toLowerCase())
  );
  return key ? [...JOB_SKILL_REQUIREMENTS[key]] : [];
}

export function getJobRoleOptions(): string[] {
  return Object.keys(JOB_SKILL_REQUIREMENTS);
}
