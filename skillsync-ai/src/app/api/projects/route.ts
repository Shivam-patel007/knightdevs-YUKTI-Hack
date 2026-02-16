/**
 * Portfolio Proof Linker - Projects API
 * GET: List all projects for authenticated user
 * POST: Create a new project
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest, verifyToken } from "@/lib/auth";
import { User } from "@/models/User";
import { IProject } from "@/types/project";
import { updateProjectVerification } from "@/services/project-verification.service";

export const runtime = "nodejs";

/**
 * GET /api/projects - List all projects for authenticated user
 */
export async function GET(req: NextRequest) {
  const token = getAuthFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findById(payload.userId).select("projects").lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const projects = (user.projects || []).map((p: any) => ({
      _id: p._id?.toString(),
      title: p.title,
      description: p.description,
      skills: p.skills || [],
      verificationStatus: p.verificationStatus || "No Proof Attached",
      proofLinks: p.proofLinks || [],
      autoVerified: p.autoVerified || false,
    }));

    return NextResponse.json({ projects });
  } catch (e) {
    console.error("List projects error:", e);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects - Create a new project
 */
export async function POST(req: NextRequest) {
  const token = getAuthFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, skills } = body as {
      title?: string;
      description?: string;
      skills?: string[];
    };

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Project title is required" },
        { status: 400 }
      );
    }

    const projectData: Partial<IProject> = {
      title: title.trim(),
      description: description?.trim(),
      skills: Array.isArray(skills) ? skills.filter((s) => typeof s === "string") : [],
      proofLinks: [],
    };

    // Calculate verification status
    const updatedProject = updateProjectVerification(projectData);

    await connectDB();
    const user = await User.findByIdAndUpdate(
      payload.userId,
      {
        $push: {
          projects: updatedProject,
        },
      },
      { new: true }
    ).select("projects");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newProject = user.projects?.[user.projects.length - 1];
    return NextResponse.json(
      {
        project: {
          _id: newProject?._id?.toString(),
          title: newProject?.title,
          description: newProject?.description,
          skills: newProject?.skills || [],
          verificationStatus: newProject?.verificationStatus || "No Proof Attached",
          proofLinks: newProject?.proofLinks || [],
          autoVerified: newProject?.autoVerified || false,
        },
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Create project error:", e);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
