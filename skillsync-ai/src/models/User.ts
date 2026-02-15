import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  savedJobs: string[];
  resumeUrl?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    savedJobs: { type: [String], default: [] },
    resumeUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const User = models.User ?? model<IUser>("User", UserSchema);
