/**
 * ATS Resume Matcher - Server entry point
 * Listens on PORT (default 5000).
 */

const app = require("./app");

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`ATS Resume Matcher API running at http://localhost:${PORT}`);
  console.log(`POST /api/ats-match - upload job description + resume PDF`);
});
