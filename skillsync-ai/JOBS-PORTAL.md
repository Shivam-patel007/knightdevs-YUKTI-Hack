# Job Portal (Full-Stack)

Job Portal is built with Next.js 14 (App Router), TypeScript, Tailwind, MongoDB (Mongoose), and IndianAPI Jobs API.

## Setup

1. **Install dependencies** (includes `bcryptjs`, `jose` for auth):
   ```bash
   npm install
   ```

2. **Environment variables** (in `skillsync-ai/.env`):
   ```env
   MONGODB_URI=mongodb://localhost:27017/skillsync-jobs
   SERP_API_KEY=your_key_from_serpapi.com
   CUSTOM_SEARCH_ENGINE_ID=your_search_engine_id_from_programmablesearchengine.google.com
   JWT_SECRET=your-random-secret-for-production
   ```

3. **MongoDB**: Run MongoDB locally or use MongoDB Atlas and set `MONGODB_URI`.

4. **Google Custom Search**:
   - Enable [Custom Search API](https://console.cloud.google.com/apis/library/customsearch.googleapis.com) in your Google Cloud project.
   - Get an API key from [serpapi.com](https://serpapi.com) and set `SERP_API_KEY`.
   - Create a Programmable Search Engine at [programmablesearchengine.google.com](https://programmablesearchengine.google.com/) (e.g. "Search the entire web"), then set `CUSTOM_SEARCH_ENGINE_ID` to the **Search engine ID** (cx).

## Routes

| Route | Description |
|-------|-------------|
| `/jobs` | Job search (title, location, skills), paginated |
| `/jobs/[id]` | Job details, Apply, Save job |
| `/jobs/login` | Login |
| `/jobs/register` | Sign up |
| `/jobs/dashboard` | User: applied jobs, saved jobs, resume upload |
| `/jobs/admin` | Admin: total users, total applications, recent applications |

## API (backend only; keys never exposed)

- `POST /api/jobs/auth/register` – Sign up
- `POST /api/jobs/auth/login` – Login
- `GET /api/jobs?title=&location=&skills=&page=&limit=` – Fetch jobs (SerpAPI Google Jobs)
- `GET /api/jobs/[id]` – Single job (decoded from job payload)
- `POST /api/jobs/applications` – Apply (auth)
- `GET /api/jobs/applications` – My applications (auth)
- `GET/POST/DELETE /api/jobs/saved` – Saved jobs (auth)
- `POST /api/jobs/resume` – Upload PDF resume (auth)
- `GET /api/jobs/admin/stats` – Admin stats (admin only)

## Creating an admin user

1. Register a user via `/jobs/register`.
2. In MongoDB, set that user's `role` to `"admin"`:
   ```js
   db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
   ```

## Resume uploads

Resumes are stored under `public/uploads/resumes/`. For Vercel (serverless), replace this with Vercel Blob or S3 in `src/app/api/jobs/resume/route.ts`.

## Deploy (Vercel)

- Set `MONGODB_URI`, `INDIAN_API_KEY`, and `JWT_SECRET` in Vercel environment variables.
- Resume uploads: use a blob store (e.g. Vercel Blob) and update the resume API route.
