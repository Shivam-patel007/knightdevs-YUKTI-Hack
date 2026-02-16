import mongoose, { Schema, model, models } from "mongoose";
import { IProject, VerificationStatus, ProofLinkType } from "@/types/project";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  savedJobs: string[];
  resumeUrl?: string;
  projects?: IProject[];
  createdAt: Date;
}

const ProofLinkSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["github", "linkedin", "live", "other"],
      required: true,
    },
    url: { type: String, required: true },
  },
  { _id: false }
);

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    skills: [{ type: String }],
    proofLinks: { type: [ProofLinkSchema], default: [] },
    verificationStatus: {
      type: String,
      enum: ["Verified", "No Proof Attached"],
      default: "No Proof Attached",
    },
    autoVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    savedJobs: { type: [String], default: [] },
    resumeUrl: { type: String },
    projects: { type: [ProjectSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const User = models.User ?? model<IUser>("User", UserSchema);
