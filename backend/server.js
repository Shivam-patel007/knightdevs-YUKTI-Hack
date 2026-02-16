/**
 * ATS Resume Matcher - Backend
 * Express server on PORT 5000. POST /api/ats-match accepts jobDescription + resume PDF.
 */

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");

const PORT = Number(process.env.PORT) || 5000;

// -----------------------------------------------------------------------------
// Skill list (used for matching)
// -----------------------------------------------------------------------------
const skillList = [
  "react",
  "reactjs",
  "node.js",
  "nodejs",
  "express",
  "mongodb",
  "mysql",
  "postgresql",
  "javascript",
  "typescript",
  "python",
  "java",
  "c++",
  "aws",
  "docker",
  "kubernetes",
  "git",
  "github",
  "rest api",
  "next.js",
  "html",
  "css",
  "tailwind",
];

// Canonical form for deduplication (e.g. nodejs + node.js → one entry)
const canonicalMap = { nodejs: "node.js", reactjs: "react", "react.js": "react" };

/**
 * normalize(text) — lowercase, remove dots, collapse extra spaces
 */
function normalize(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * extractSkills(text) — match skills from skillList, dedupe, return unique array
 */
function extractSkills(text) {
  const normalizedText = normalize(text);
  if (!normalizedText) return [];

  const found = new Set();
  // Match longer phrases first (e.g. "javascript" before "java")
  const sorted = [...skillList].sort((a, b) => b.length - a.length);

  for (const skill of sorted) {
    const normSkill = normalize(skill);
    if (normSkill && normalizedText.includes(normSkill)) {
      found.add(canonicalMap[skill] || skill);
    }
  }

  return [...found].sort();
}

// -----------------------------------------------------------------------------
// Multer: memory storage, PDF only, 5MB limit
// -----------------------------------------------------------------------------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed."), false);
  },
});

const app = express();

// CORS: allow SkillSync frontend (localhost:3000) and same-origin
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());

// -----------------------------------------------------------------------------
// Health check (for frontend to verify backend is running)
// -----------------------------------------------------------------------------
app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, service: "ats-backend" });
});

// -----------------------------------------------------------------------------
// POST /api/ats-match
// -----------------------------------------------------------------------------
app.post("/api/ats-match", upload.single("resume"), async (req, res) => {
  try {
    const jobDescription =
      typeof req.body.jobDescription === "string"
        ? req.body.jobDescription.trim()
        : "";

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        error: "Job description is required and cannot be empty.",
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        error: "Resume file is required. Please upload a PDF.",
      });
    }

    let resumeText;
    try {
      const pdfData = await pdfParse(req.file.buffer);
      resumeText =
        pdfData && typeof pdfData.text === "string" ? pdfData.text.trim() : "";
    } catch {
      return res.status(400).json({
        success: false,
        error: "Failed to parse the PDF. Use a valid PDF with extractable text.",
      });
    }

    const jdSkills = extractSkills(jobDescription);
    const resumeSkills = extractSkills(resumeText);

    const resumeSet = new Set(resumeSkills);
    const matchedSkills = jdSkills.filter((s) => resumeSet.has(s));
    const missingSkills = jdSkills.filter((s) => !resumeSet.has(s));

    let atsScore = 0;
    if (jdSkills.length > 0) {
      atsScore = Math.round((matchedSkills.length / jdSkills.length) * 100);
    }

    // Resume score: based on skills breadth and content length (0–100)
    const skillsPart = Math.min(50, resumeSkills.length * 5);
    const lengthPart = Math.min(50, Math.floor(resumeText.length / 40));
    const resumeScore = Math.min(100, Math.round(skillsPart + lengthPart));

    const improvementSuggestions = missingSkills.map(
      (skill) => `Add ${skill} to improve your ATS score`
    );

    return res.status(200).json({
      atsScore,
      resumeScore,
      jdSkills,
      resumeSkills,
      matchedSkills,
      missingSkills,
      improvementSuggestions,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "An unexpected error occurred.",
    });
  }
});

// -----------------------------------------------------------------------------
// POST /api/ats-match-skills
// Matches resume against a stored required skills array (for job roles dropdown)
// -----------------------------------------------------------------------------
app.post("/api/ats-match-skills", upload.single("resume"), async (req, res) => {
  try {
    let requiredSkills = [];
    if (req.body.requiredSkills) {
      try {
        requiredSkills = Array.isArray(req.body.requiredSkills)
          ? req.body.requiredSkills
          : JSON.parse(req.body.requiredSkills);
      } catch {
        return res.status(400).json({
          success: false,
          error: "requiredSkills must be a valid array.",
        });
      }
    }

    if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
      return res.status(400).json({
        success: false,
        error: "requiredSkills array is required and cannot be empty.",
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        error: "Resume file is required. Please upload a PDF.",
      });
    }

    let resumeText;
    try {
      const pdfData = await pdfParse(req.file.buffer);
      resumeText =
        pdfData && typeof pdfData.text === "string" ? pdfData.text.trim() : "";
    } catch {
      return res.status(400).json({
        success: false,
        error: "Failed to parse the PDF. Use a valid PDF with extractable text.",
      });
    }

    const resumeSkills = extractSkills(resumeText);
    const requiredSet = new Set(requiredSkills.map((s) => s.toLowerCase().trim()));
    const resumeSet = new Set(resumeSkills);

    const matchedSkills = requiredSkills.filter((s) =>
      resumeSet.has(s.toLowerCase().trim())
    );
    const missingSkills = requiredSkills.filter(
      (s) => !resumeSet.has(s.toLowerCase().trim())
    );

    let atsScore = 0;
    if (requiredSkills.length > 0) {
      atsScore = Math.round((matchedSkills.length / requiredSkills.length) * 100);
    }

    const skillsPart = Math.min(50, resumeSkills.length * 5);
    const lengthPart = Math.min(50, Math.floor(resumeText.length / 40));
    const resumeScore = Math.min(100, Math.round(skillsPart + lengthPart));

    const improvementSuggestions = missingSkills.map(
      (skill) => `Add ${skill} to improve your ATS score`
    );

    return res.status(200).json({
      atsScore,
      resumeScore,
      requiredSkills,
      resumeSkills,
      matchedSkills,
      missingSkills,
      improvementSuggestions,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "An unexpected error occurred.",
    });
  }
});

// -----------------------------------------------------------------------------
// Error handler (multer errors)
// -----------------------------------------------------------------------------
app.use((err, _req, res, _next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      error: "File too large. Maximum size is 5MB.",
    });
  }
  if (err.message && err.message.includes("PDF")) {
    return res.status(400).json({ success: false, error: err.message });
  }
  res.status(500).json({ success: false, error: "An unexpected error occurred." });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`ATS Backend running at http://localhost:${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/health`);
});
