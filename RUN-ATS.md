# Run ATS Resume Matcher (frontend + backend)

Both must be running for the ATS Matcher to work.

## 1. Start the ATS backend (port 5000)

**Option A – from project root:**
```bash
cd "SkillSync Ai\backend"
npm start
```

**Option B – from skillsync-ai folder:**
```bash
cd skillsync-ai
npm run ats-backend
```

Leave this terminal **open**. You should see: `ATS Backend running at http://localhost:5000`.

## 2. Start the frontend (port 3000)

In a **second terminal**:
```bash
cd "SkillSync Ai\skillsync-ai"
npm run dev
```

## 3. Use the app

1. Open **http://localhost:3000**
2. Click **ATS Matcher** in the nav or the **ATS Resume Matcher** card on the home page
3. On the ATS page you should see **"Backend connected"** (green) if the backend is running
4. Paste a job description, upload a PDF resume, click **Get ATS Score**

If you see **"ATS backend is not running"** (amber box), start the backend (step 1) and refresh the page.
