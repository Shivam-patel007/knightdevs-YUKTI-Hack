import mongoose, { Schema, model, models } from "mongoose";

export interface IApplication {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  jobId: string;
  jobSnapshot?: Record<string, unknown>;
  resumeUrl?: string;
  status: "applied" | "viewed" | "shortlisted";
  createdAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    jobId: { type: String, required: true },
    jobSnapshot: { type: Schema.Types.Mixed },
    resumeUrl: { type: String },
    status: {
      type: String,
      enum: ["applied", "viewed", "shortlisted"],
      default: "applied",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export const Application =
  models.Application ?? model<IApplication>("Application", ApplicationSchema);
