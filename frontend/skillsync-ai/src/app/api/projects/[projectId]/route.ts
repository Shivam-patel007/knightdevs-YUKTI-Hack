/**
 * Portfolio Proof Linker - Single Project API
 * GET: Get project by ID
 * PUT: Update project
 * DELETE: Delete project
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest, verifyToken } from "@/lib/auth";
import { User } from "@/models/User";
import { IProject } from "@/types/project";
import { updateProjectVerification } from "@/services/project-verification.service";
import mongoose from "mongoose";

export const runtime = "nodejs";

/**
 * GET /api/projects/:projectId - Get project by ID
 */
export async function GET(
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

    await connectDB();
    const user = await User.findById(payload.userId).select("projects").lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const project = (user.projects || []).find(
      (p: any) => p._id?.toString() === projectId
    );

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      project: {
        _id: project._id?.toString(),
        title: project.title,
        description: project.description,
        skills: project.skills || [],
        verificationStatus: project.verificationStatus || "No Proof Attached",
        proofLinks: project.proofLinks || [],
        autoVerified: project.autoVerified || false,
      },
    });
  } catch (e) {
    console.error("Get project error:", e);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/:projectId - Update project
 */
export async function PUT(
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
    const { title, description, skills } = body as {
      title?: string;
      description?: string;
      skills?: string[];
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
    const updatedProject: Partial<IProject> = {
      title: title !== undefined ? title.trim() : existingProject.title,
      description: description !== undefined ? description?.trim() : existingProject.description,
      skills: skills !== undefined ? (Array.isArray(skills) ? skills.filter((s) => typeof s === "string") : existingProject.skills) : existingProject.skills,
      proofLinks: existingProject.proofLinks || [],
    };

    // Recalculate verification status
    const verifiedProject = updateProjectVerification(updatedProject);

    await User.updateOne(
      { _id: payload.userId, "projects._id": projectId },
      {
        $set: {
          [`projects.${projectIndex}.title`]: verifiedProject.title,
          [`projects.${projectIndex}.description`]: verifiedProject.description,
          [`projects.${projectIndex}.skills`]: verifiedProject.skills,
          [`projects.${projectIndex}.verificationStatus`]: verifiedProject.verificationStatus,
          [`projects.${projectIndex}.autoVerified`]: verifiedProject.autoVerified,
        },
      }
    );

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
    console.error("Update project error:", e);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/:projectId - Delete project
 */
export async function DELETE(
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

    await connectDB();
    const result = await User.updateOne(
      { _id: payload.userId },
      {
        $pull: {
          projects: { _id: projectId },
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ deleted: true });
  } catch (e) {
    console.error("Delete project error:", e);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
