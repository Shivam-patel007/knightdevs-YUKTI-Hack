/**
 * ATS Resume Matcher - Express application
 * Configures CORS, JSON body parsing, and ATS API routes.
 */

const express = require("express");
const path = require("path");
const cors = require("cors");
const atsRoutes = require("./routes/ats");

const app = express();

// CORS: allow all origins in development; tighten in production
app.use(cors());

// JSON body parsing (for any non-multipart JSON requests)
app.use(express.json());

// Test page: open in browser to try the ATS matcher
app.use(express.static(path.join(__dirname, "public")));

// API routes (multipart handled inside route via multer)
app.use("/api", atsRoutes);

// Health check for load balancers / monitoring
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "ats-resume-api" });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Not found" });
});

// Global error handler (e.g. multer "file too large" or "only PDF" errors)
app.use((err, _req, res, _next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      error: "File too large. Maximum size is 5MB.",
    });
  }
  if (err.message && err.message.includes("PDF")) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "An unexpected error occurred.",
  });
});

module.exports = app;
