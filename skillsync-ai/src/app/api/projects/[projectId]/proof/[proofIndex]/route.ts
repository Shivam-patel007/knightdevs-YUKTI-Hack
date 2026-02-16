/**
 * Portfolio Proof Linker - Delete Proof Link from Project
 * DELETE /api/projects/:projectId/proof/:proofIndex
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest, verifyToken } from "@/lib/auth";
import { User } from "@/models/User";
import { updateProjectVerification } from "@/services/project-verification.service";
import mongoose from "mongoose";

export const runtime = "nodejs";

/**
 * DELETE /api/projects/:projectId/proof/:proofIndex - Remove proof link from project
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string; proofIndex: string } }
) {
  const token = getAuthFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { projectId, proofIndex } = params;
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const index = parseInt(proofIndex, 10);
    if (isNaN(index) || index < 0) {
      return NextResponse.json({ error: "Invalid proof link index" }, { status: 400 });
    }

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

    if (index >= existingProofLinks.length) {
      return NextResponse.json(
        { error: "Proof link index out of range" },
        { status: 400 }
      );
    }

    // Remove proof link
    const updatedProofLinks = existingProofLinks.filter(
      (_: any, i: number) => i !== index
    );

    // Recalculate verification
    const updatedProject = {
      ...existingProject,
      proofLinks: updatedProofLinks,
    };
    const verifiedProject = updateProjectVerification(updatedProject);

    // Update database
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

    return NextResponse.json({
      project: {
        _id: savedProject?._id?.toString(),
        title: savedProject?.title,
        description: savedProject?.description,
        skills: savedProject?.skills || [],
        verificationStatus: savedProject?.verificationStatus || "No Proof Attached",
        proofLinks: savedProject?.proofLinks || [],
        autoVerified: savedProject?.autoVerified || false,
      },
    });
  } catch (e) {
    console.error("Delete proof link error:", e);
    return NextResponse.json(
      { error: "Failed to remove proof link" },
      { status: 500 }
    );
  }
}
