# SkillSync AI – Production Architecture

## Folder Structure

```
skillsync-ai/
├── prisma/
│   ├── schema.prisma      # PostgreSQL schema
│   └── seed.ts            # Role seed data
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/           # POST: analyze resume
│   │   │   ├── parse-resume/      # POST: extract PDF text
│   │   │   ├── resume/upload/     # POST: upload + parse
│   │   │   ├── roadmap/           # POST: generate roadmap
│   │   │   ├── youtube/           # POST: YouTube resources
│   │   │   └── learning-resources/# POST: learning resources
│   │   ├── upload/
│   │   └── dashboard/
│   ├── components/
│   ├── data/
│   │   └── roles.ts       # Role definitions
│   ├── lib/
│   │   ├── openrouter.ts  # OpenRouter API client
│   │   ├── db.ts          # Prisma client
│   │   └── utils.ts
│   ├── services/
│   │   ├── ai.service.ts       # Skill extraction, roadmap
│   │   ├── resume.service.ts   # PDF parsing
│   │   ├── skill-gap.service.ts# Skill comparison
│   │   ├── ats.service.ts      # ATS scoring
│   │   └── youtube.service.ts  # YouTube Data API
│   └── types/
│       ├── schemas.ts     # Zod schemas
│       └── index.ts
└── .env.example
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/parse-resume` | POST | Extract text from PDF |
| `/api/resume/upload` | POST | Upload PDF, return text |
| `/api/analyze` | POST | Full analysis: skills, gap, ATS, roadmap |
| `/api/roadmap` | POST | Generate 6‑month roadmap |
| `/api/youtube` | POST | YouTube videos for skills |
| `/api/learning-resources` | POST | Learning resources (YouTube API or AI) |

## Database (PostgreSQL + Prisma)

Run:
```bash
npm run db:generate   # Generate client
npm run db:push       # Push schema (dev)
npm run db:seed       # Seed roles
npm run db:studio     # Prisma Studio
```

## Environment Variables

See `.env.example` for:
- `DATABASE_URL` – PostgreSQL connection
- `OPENROUTER_API_KEY` or `OPENAI_API_KEY` – LLM
- `YOUTUBE_API_KEY` – YouTube Data API v3 (optional)
- `NEXTAUTH_*` – Auth (when enabled)

## AI Response Schemas (Zod)

- `ExtractedSkills`: technical_skills, soft_skills, tools, experience_level
- `RoadmapResponse`: months with focusSkills, projects, weeklyGoals
- `SkillGapResult`: matched_skills, missing_skills, skill_match_percentage
- `AtsResult`: score (0–100), notes
