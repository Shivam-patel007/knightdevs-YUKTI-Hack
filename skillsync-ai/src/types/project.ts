/**
 * Portfolio Proof Linker - Project types and interfaces
 */

export type ProofLinkType = "github" | "linkedin" | "live" | "other";

export type VerificationStatus = "Verified" | "No Proof Attached";

export interface IProofLink {
  type: ProofLinkType;
  url: string;
}

export interface IProject {
  _id?: string;
  title: string;
  description?: string;
  skills: string[];
  proofLinks: IProofLink[];
  verificationStatus: VerificationStatus;
  autoVerified?: boolean;
}
