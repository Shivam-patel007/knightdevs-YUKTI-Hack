/**
 * ATS Resume Matcher - API routes
 * POST /api/ats-match: compare job description and resume PDF, return ATS score and suggestions.
 */

const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { extractSkills } = require("../helpers/skills");

const router = express.Router();

// In-memory storage for PDF upload (no disk write). File size limit 5MB.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["application/pdf"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed."), false);
    }
  },
});

/**
 * Parse PDF buffer to text using pdf-parse.
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
function parsePdfBuffer(buffer) {
  return pdfParse(buffer);
}

/**
 * Format a skill for display in suggestions (e.g. "node.js" -> "Node.js").
 */
function formatSkillForSuggestion(skill) {
  if (skill === "node.js") return "Node.js";
  if (skill === "next.js") return "Next.js";
  if (skill === "c++") return "C++";
  if (skill === "rest api") return "REST API";
  return skill.charAt(0).toUpperCase() + skill.slice(1);
}

/**
 * POST /api/ats-match
 *
 * Body (multipart/form-data):
 *   - jobDescription: string (required)
 *   - resume: PDF file (required)
 *
 * Response: { atsScore, jdSkills, resumeSkills, matchedSkills, missingSkills, improvementSuggestions }
 */
router.post("/ats-match", upload.single("resume"), async (req, res) => {
  try {
    // --- Validation ---
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
      const pdfResult = await parsePdfBuffer(req.file.buffer);
      resumeText =
        pdfResult && typeof pdfResult.text === "string"
          ? pdfResult.text.trim()
          : "";
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: "Failed to parse the uploaded PDF. Ensure it is a valid PDF with extractable text.",
      });
    }

    // --- Extract skills ---
    const jdSkills = extractSkills(jobDescription);
    const resumeSkills = extractSkills(resumeText);

    const matchedSet = new Set(resumeSkills);
    const matchedSkills = jdSkills.filter((s) => matchedSet.has(s));
    const missingSkills = jdSkills.filter((s) => !matchedSet.has(s));

    // --- ATS score ---
    let atsScore = 0;
    if (jdSkills.length > 0) {
      atsScore = Math.round((matchedSkills.length / jdSkills.length) * 100);
    }

    // --- Improvement suggestions ---
    const improvementSuggestions = missingSkills.map(
      (skill) => `Add ${formatSkillForSuggestion(skill)} to increase your ATS score`
    );

    return res.status(200).json({
      atsScore,
      jdSkills,
      resumeSkills,
      matchedSkills,
      missingSkills,
      improvementSuggestions,
    });
  } catch (err) {
    console.error("ATS match error:", err);
    return res.status(500).json({
      success: false,
      error: "An unexpected error occurred while processing your request.",
    });
  }
});

module.exports = router;
