/** Job listing (from Custom Search API or other source) */
export type IndianJob = {
  id: number | string;
  title: string;
  job_title?: string;
  company: string;
  about_company?: string;
  job_description: string;
  job_type?: string;
  location: string;
  experience?: string;
  role_and_responsibility?: string;
  education_and_skills?: string;
  apply_link: string;
  posted_date?: string;
  snippet?: string;
};

export type JobSearchParams = {
  title?: string;
  location?: string;
  company?: string;
  job_type?: string;
  experience?: string;
  skills?: string;
  limit?: number;
  offset?: number;
};

export type JwtPayload = {
  userId: string;
  email: string;
  role: "user" | "admin";
};
