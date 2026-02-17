/**
 * Role definitions - used when Prisma is not connected (demo mode)
 * In production, load from DB: prisma.role.findMany()
 */

export type RoleDefinition = {
  roleName: string;
  requiredSkills: string[];
};

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    roleName: "Full Stack Developer",
    requiredSkills: [
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "REST APIs",
      "SQL",
      "Git",
      "Testing",
      "Responsive Design",
      "Databases",
    ],
  },
  {
    roleName: "Frontend Developer",
    requiredSkills: [
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Tailwind CSS",
      "Responsive Design",
      "Git",
      "REST APIs",
      "Testing",
      "Accessibility",
    ],
  },
  {
    roleName: "Backend Developer",
    requiredSkills: [
      "Node.js",
      "Express",
      "REST APIs",
      "Authentication",
      "Databases",
      "SQL",
      "NoSQL",
      "MongoDB",
      "TypeScript",
      "Testing",
      "Docker",
      "Git",
    ],
  },
  {
    roleName: "Data Scientist",
    requiredSkills: [
      "Python",
      "SQL",
      "Pandas",
      "NumPy",
      "Scikit-learn",
      "Data Visualization",
      "Statistics",
      "Machine Learning",
      "Jupyter",
      "TensorFlow",
      "ETL",
    ],
  },
  {
    roleName: "Data Analyst",
    requiredSkills: [
      "SQL",
      "Python",
      "Pandas",
      "NumPy",
      "Data Visualization",
      "Excel",
      "Statistics",
      "Power BI",
      "Tableau",
      "ETL",
    ],
  },
  {
    roleName: "AI Engineer",
    requiredSkills: [
      "Python",
      "Machine Learning",
      "Deep Learning",
      "PyTorch",
      "TensorFlow",
      "Data Preprocessing",
      "Model Deployment",
      "MLOps",
      "Cloud Platforms",
      "Vector Databases",
    ],
  },
  {
    roleName: "Cyber Security",
    requiredSkills: [
      "Networking",
      "Linux",
      "Security Fundamentals",
      "Threat Modeling",
      "Vulnerability Assessment",
      "Penetration Testing",
      "SIEM",
      "Incident Response",
      "Cloud Security",
      "Scripting",
    ],
  },
];

export function getRoleByName(name: string): RoleDefinition | undefined {
  return ROLE_DEFINITIONS.find((r) => r.roleName === name);
}
