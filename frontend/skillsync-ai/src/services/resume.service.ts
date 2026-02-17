/**
 * Extract raw text from PDF buffer using pdf-parse
 */

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  // pdf-parse v1: function(buffer) => Promise<{ text }>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");
  const data = await pdfParse(buffer);
  const text = (data && typeof data === "object" && data.text) ? String(data.text) : "";
  if (!text.trim()) {
    throw new Error("Could not extract text from PDF. The file may be scanned (image-only) or corrupted.");
  }
  return text;
}
