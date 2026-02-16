/**
 * Portfolio Proof Linker - Add Proof Link to Project
 * POST /api/projects/:projectId/proof
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest, verifyToken } from "@/lib/auth";
import { User } from "@/models/User";
import { IProofLink, ProofLinkType } from "@/types/project";
import {
  isValidUrl,
  isDuplicateProofLink,
  updateProjectVerification,
} from "@/services/project-verification.service";
import mongoose from "mongoose";

export const runtime = "nodejs";

/**
 * POST /api/projects/:projectId/proof - Add proof link to project
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const token = getAuthFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { projectId } = params;
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const body = await req.json();
    const { type, url } = body as {
      type?: string;
      url?: string;
    };

    // Validation
    if (!type || !["github", "linkedin", "live", "other"].includes(type)) {
      return NextResponse.json(
        { error: "Valid type is required (github, linkedin, live, or other)" },
        { status: 400 }
      );
    }

    if (!url || typeof url !== "string" || url.trim().length === 0) {
      return NextResponse.json(
        { error: "URL is required and cannot be empty" },
        { status: 400 }
      );
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: "Invalid URL format. Must be a valid http:// or https:// URL" },
        { status: 400 }
      );
    }

    const proofLink: IProofLink = {
      type: type as ProofLinkType,
      url: url.trim(),
    };

    await connectDB();
    const user = await User.findById(payload.userId).select("projects").lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const projectIndex = (user.projects || []).findIndex(
      (p: any) => p._id?.toString() === projectId
    );

    if (projectIndex === -1) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const existingProject = user.projects?.[projectIndex] as any;
    const existingProofLinks = existingProject.proofLinks || [];

    // Check for duplicates
    if (isDuplicateProofLink(existingProofLinks, proofLink)) {
      return NextResponse.json(
        { error: "This proof link already exists for this project" },
        { status: 409 }
      );
    }

    // Add proof link and recalculate verification
    const updatedProject = {
      ...existingProject,
      proofLinks: [...existingProofLinks, proofLink],
    };
    const verifiedProject = updateProjectVerification(updatedProject);

    // Update the project in database
    await User.updateOne(
      { _id: payload.userId, "projects._id": projectId },
      {
        $set: {
          [`projects.${projectIndex}.proofLinks`]: verifiedProject.proofLinks,
          [`projects.${projectIndex}.verificationStatus`]: verifiedProject.verificationStatus,
          [`projects.${projectIndex}.autoVerified`]: verifiedProject.autoVerified,
        },
      }
    );

    // Fetch updated project
    const updated = await User.findById(payload.userId).select("projects").lean();
    const savedProject = updated?.projects?.[projectIndex] as any;

    return NextResponse.json(
      {
        project: {
          _id: savedProject?._id?.toString(),
          title: savedProject?.title,
          description: savedProject?.description,
          skills: savedProject?.skills || [],
          verificationStatus: savedProject?.verificationStatus || "No Proof Attached",
          proofLinks: savedProject?.proofLinks || [],
          autoVerified: savedProject?.autoVerified || false,
        },
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("Add proof link error:", e);
    return NextResponse.json(
      { error: "Failed to add proof link" },
      { status: 500 }
    );
  }
}
