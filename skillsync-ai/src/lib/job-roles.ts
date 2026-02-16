/**
 * Stored job roles and their required skills (descriptions aligned with ATS backend skillList).
 * Users select a role from dropdown to test their resume score.
 */

export interface JobRole {
  id: string;
  title: string;
  description: string;
  /** Required skills (subset of ATS skillList) — for display only; extraction is from description */
  requiredSkills: string[];
}

export const JOB_ROLES: JobRole[] = [
  {
    id: "data-analyst",
    title: "Data Analyst",
    description: `Data Analyst

We are looking for a Data Analyst to turn data into insights and reports.

Requirements:
- Strong experience with Python for data analysis and scripting
- Proficiency in SQL and relational databases: MySQL, PostgreSQL
- Experience with Git and GitHub for version control and collaboration
- Ability to build and document processes
- REST API knowledge for data integration is a plus
- JavaScript or TypeScript for dashboards/visualization tools is desirable

You will use Python, MySQL, PostgreSQL, Git, and REST API in your daily work.`,
    requiredSkills: ["python", "mysql", "postgresql", "git", "rest api", "javascript", "typescript"],
  },
  {
    id: "ai-ml-engineer",
    title: "AI/ML Engineer",
    description: `AI/ML Engineer

Join our team to build and deploy machine learning models.

Requirements:
- Strong Python for ML model development and scripting
- Experience with Docker and Kubernetes for model deployment
- Cloud platforms: AWS for training and serving
- Version control with Git and GitHub
- REST API design for model serving
- Knowledge of databases (PostgreSQL, MongoDB) for feature stores

Tech stack: Python, Docker, Kubernetes, AWS, Git, REST API, PostgreSQL, MongoDB.`,
    requiredSkills: ["python", "docker", "kubernetes", "aws", "git", "rest api", "postgresql", "mongodb"],
  },
  {
    id: "frontend-developer",
    title: "Frontend Developer",
    description: `Frontend Developer

We need a Frontend Developer to build responsive, accessible web applications.

Requirements:
- Strong experience with React and modern JavaScript (ES6+)
- Proficiency in HTML, CSS, and Tailwind for styling
- Experience with Git and GitHub for version control
- TypeScript for type-safe code
- Next.js for SSR/SSG is a plus

You will work with React, JavaScript, TypeScript, HTML, CSS, Tailwind, Next.js, and Git daily.`,
    requiredSkills: ["react", "javascript", "typescript", "html", "css", "tailwind", "next.js", "git"],
  },
  {
    id: "backend-developer",
    title: "Backend Developer",
    description: `Backend Developer

We are looking for a Backend Developer to build scalable APIs and services.

Requirements:
- Experience with Node.js and Express or Python for backend development
- Databases: MySQL, PostgreSQL, MongoDB
- REST API design and implementation
- Docker for local development and deployment
- Git and GitHub for version control

Tech stack: Node.js, Express, Python, MySQL, PostgreSQL, MongoDB, REST API, Docker, Git.`,
    requiredSkills: ["node.js", "express", "python", "mysql", "postgresql", "mongodb", "rest api", "docker", "git"],
  },
  {
    id: "full-stack-engineer",
    title: "Full Stack Engineer",
    description: `Full Stack Engineer

Join our team to build end-to-end web applications.

Requirements:
- Frontend: React, JavaScript or TypeScript, HTML, CSS, Tailwind
- Backend: Node.js, Express
- Databases: MongoDB or PostgreSQL
- REST API design and consumption
- Version control with Git and GitHub
- Next.js experience is a plus

You will use React, Node.js, Express, MongoDB, PostgreSQL, REST API, JavaScript, TypeScript, Git, HTML, CSS, and Tailwind.`,
    requiredSkills: ["react", "node.js", "express", "mongodb", "postgresql", "rest api", "javascript", "typescript", "git", "html", "css", "tailwind", "next.js"],
  },
  {
    id: "devops-engineer",
    title: "DevOps Engineer",
    description: `DevOps Engineer

We need a DevOps Engineer to own CI/CD, infrastructure, and reliability.

Requirements:
- Cloud: AWS (EC2, Lambda, S3, EKS)
- Containers: Docker and Kubernetes
- Scripting: Python or JavaScript
- Version control: Git and GitHub
- REST API and system integration experience
- Databases: MySQL, PostgreSQL for infrastructure tooling

You will work with AWS, Docker, Kubernetes, Python, Git, REST API, MySQL, and PostgreSQL.`,
    requiredSkills: ["aws", "docker", "kubernetes", "python", "git", "rest api", "mysql", "postgresql"],
  },
  {
    id: "database-engineer",
    title: "Database Engineer",
    description: `Database Engineer

We are looking for a Database Engineer to design and maintain data systems.

Requirements:
- Strong experience with MySQL and PostgreSQL
- NoSQL: MongoDB for document stores
- Python or Node.js for scripts and tooling
- AWS for managed databases (RDS, DocumentDB)
- REST API for data access layers
- Git and GitHub for schema and migration versioning

Tech stack: MySQL, PostgreSQL, MongoDB, Python, Node.js, AWS, REST API, Git.`,
    requiredSkills: ["mysql", "postgresql", "mongodb", "python", "node.js", "aws", "rest api", "git"],
  },
];

export const JOB_ROLE_IDS = JOB_ROLES.map((r) => r.id);
export const CUSTOM_JOB_ID = "custom";

export function getJobRoleById(id: string): JobRole | undefined {
  return JOB_ROLES.find((r) => r.id === id);
}
