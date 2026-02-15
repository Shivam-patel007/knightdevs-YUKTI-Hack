import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromRequest, verifyToken } from "@/lib/auth";
import { User } from "@/models/User";
import { Application } from "@/models/Application";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = getAuthFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();
    const [userCount, applicationCount] = await Promise.all([
      User.countDocuments(),
      Application.countDocuments(),
    ]);
    const recentApplications = await Application.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId", "name email")
      .lean();

    return NextResponse.json({
      totalUsers: userCount,
      totalApplications: applicationCount,
      recentApplications,
    });
  } catch (e) {
    console.error("Admin stats error:", e);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
