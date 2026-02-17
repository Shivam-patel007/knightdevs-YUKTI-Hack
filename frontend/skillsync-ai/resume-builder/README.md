# AI Resume Builder

Part of **SkillSync AI**. React + Vite app for building resumes with AI-powered content (OpenRouter / Claude).

## File structure

- **`skillsync-ai/resume-builder/`** – This folder (canonical app).
- **`skillsync-ai/src/app/resume-builder/page.tsx`** – Next.js route; resume builder shows on the frontend at `/resume-builder`.
- **`skillsync-ai/public/resume-builder/`** – Built app (from `npm run build:embed`). Served by Next.js so the iframe works.

## Show on SkillSync frontend

```bash
npm run build:embed
```

Then start Next.js (`npm run dev` from skillsync-ai) and open **Resume Builder** in the nav or go to `/resume-builder`.

## Run standalone

```bash
npm run dev
npm run build
```

From repo root: `npm run dev:resume` / `npm run build:resume`.

Set `VITE_OPENROUTER_API_KEY` in `.env` for AI features.
