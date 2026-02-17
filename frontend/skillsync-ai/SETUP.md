# SkillSync AI – Setup Checklist

Ensure resume upload → analyze → dashboard works:

## 1. Environment variables

Create `skillsync-ai/.env` (copy from `.env.example`):

```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_MODEL=openai/gpt-4o-mini

# Optional:
YOUTUBE_API_KEY=...
DATABASE_URL=...
```

## 2. Run the app

```bash
cd skillsync-ai
npm run dev
```

## 3. Test the flow

1. Go to http://localhost:3000
2. Click **Upload Resume** or open http://localhost:3000/upload
3. Enter email, select target role, upload a PDF resume
4. Click **Generate skill gaps & roadmap**
5. You should be redirected to the dashboard with:
   - Match score
   - Your skills / Missing skills
   - ATS score
   - 6‑month roadmap
   - Optionally: **Get learning plan for missing skills** (uses YouTube API if `YOUTUBE_API_KEY` is set)

## Troubleshooting

- **"OPENROUTER_API_KEY or OPENAI_API_KEY is required"** → Add `OPENROUTER_API_KEY` to `skillsync-ai/.env`
- **"Invalid or expired API key"** → Verify key at openrouter.ai/keys
- **"Could not extract text from PDF"** → Try a different PDF; some scanned PDFs may fail
- **"Unable to load dashboard data"** → Ensure you complete the upload flow; don't open `/dashboard` directly without data
