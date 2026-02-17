import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ROLES = [
  {
    name: "Full Stack Developer",
    description: "End-to-end web development",
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
    name: "Frontend Developer",
    description: "UI/UX and client-side development",
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
    name: "Backend Developer",
    description: "Server-side and API development",
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
    name: "Data Scientist",
    description: "Data analysis and ML",
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
    name: "Data Analyst",
    description: "Analytics and reporting",
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
    name: "AI Engineer",
    description: "Applied AI and ML systems",
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
    name: "Cyber Security",
    description: "Security and compliance",
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

async function main() {
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      create: {
        name: role.name,
        description: role.description,
        requiredSkills: role.requiredSkills,
      },
      update: { requiredSkills: role.requiredSkills },
    });
  }
  console.log("Seeded roles");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
