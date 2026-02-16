/**
 * Predefined jobs for Resume Evaluation & Validation.
 * Used to prove ATS scoring by matching a resume against 3 distinct role profiles.
 * Skills are chosen from the ATS backend skillList for consistent extraction.
 */

export interface ValidationJob {
  id: string;
  title: string;
  description: string;
}

export const VALIDATION_JOBS: ValidationJob[] = [
  {
    id: "frontend",
    title: "Frontend Developer",
    description: `Frontend Developer

We are looking for a Frontend Developer to build responsive, accessible web applications.

Requirements:
- Strong experience with React and modern JavaScript (ES6+)
- Proficiency in HTML, CSS, and Tailwind for styling
- Experience with Git and GitHub for version control
- Familiarity with TypeScript is a plus
- Knowledge of Next.js for SSR/SSG is desirable

You will work with React, HTML, CSS, Tailwind, JavaScript, and Git on a daily basis.`,
  },
  {
    id: "fullstack",
    title: "Full Stack Developer",
    description: `Full Stack Developer

Join our team to build end-to-end web applications.

Requirements:
- Experience with Node.js and Express for backend development
- Strong frontend skills with React and JavaScript
- Database experience: MongoDB or PostgreSQL
- Building and consuming REST API
- Version control with Git and GitHub
- Bonus: TypeScript, Next.js

Tech stack: Node.js, Express, React, MongoDB, REST API, JavaScript, Git.`,
  },
  {
    id: "backend-devops",
    title: "Backend / DevOps Engineer",
    description: `Backend / DevOps Engineer

We need an engineer to own our backend services and cloud infrastructure.

Requirements:
- Backend development in Python or Node.js
- Cloud platforms: AWS (EC2, Lambda, S3)
- Containers: Docker and Kubernetes
- Databases: MySQL or PostgreSQL
- REST API design and implementation
- Git and GitHub for CI/CD workflows

You will work with Python, AWS, Docker, Kubernetes, MySQL, Git, and REST API.`,
  },
];
