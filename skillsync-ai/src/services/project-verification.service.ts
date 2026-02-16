/**
 * Portfolio Proof Linker - Project Verification Service
 * Handles verification status calculation and validation
 */

import { IProject, VerificationStatus, IProofLink } from "@/types/project";

/**
 * Check project verification status based on proof links
 * @param project - Project object (can be partial, will return updated verificationStatus)
 * @returns VerificationStatus ("Verified" or "No Proof Attached")
 */
export function checkProjectVerification(project: Partial<IProject>): VerificationStatus {
  if (project.proofLinks && Array.isArray(project.proofLinks) && project.proofLinks.length > 0) {
    // Check if at least one proof link has a valid URL
    const hasValidLink = project.proofLinks.some(
      (link) => link && link.url && typeof link.url === "string" && link.url.trim().length > 0
    );
    return hasValidLink ? "Verified" : "No Proof Attached";
  }
  return "No Proof Attached";
}

/**
 * Validate proof link URL format
 * @param url - URL string to validate
 * @returns true if valid URL format
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== "string" || url.trim().length === 0) {
    return false;
  }
  try {
    const urlObj = new URL(url.trim());
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Check if proof link already exists (prevent duplicates)
 * @param existingLinks - Array of existing proof links
 * @param newLink - New proof link to check
 * @returns true if duplicate found
 */
export function isDuplicateProofLink(
  existingLinks: IProofLink[],
  newLink: IProofLink
): boolean {
  if (!existingLinks || !Array.isArray(existingLinks) || existingLinks.length === 0) {
    return false;
  }
  return existingLinks.some(
    (link) =>
      link.url.toLowerCase().trim() === newLink.url.toLowerCase().trim() &&
      link.type === newLink.type
  );
}

/**
 * Auto-verify GitHub links (basic check)
 * @param url - URL to check
 * @returns true if URL contains github.com
 */
export function isGitHubLink(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const urlObj = new URL(url.trim());
    return urlObj.hostname.toLowerCase().includes("github.com");
  } catch {
    return url.toLowerCase().includes("github.com");
  }
}

/**
 * Update project with verification status
 * @param project - Project object to update
 * @returns Updated project with verificationStatus set
 */
export function updateProjectVerification(project: Partial<IProject>): Partial<IProject> {
  const verificationStatus = checkProjectVerification(project);
  const updated = { ...project, verificationStatus };

  // Auto-verify GitHub links if applicable
  if (
    verificationStatus === "Verified" &&
    project.proofLinks &&
    project.proofLinks.some((link) => isGitHubLink(link.url))
  ) {
    updated.autoVerified = true;
  } else {
    updated.autoVerified = false;
  }

  return updated;
}
