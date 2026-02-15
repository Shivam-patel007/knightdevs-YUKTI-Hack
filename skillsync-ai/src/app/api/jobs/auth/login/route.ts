import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyPassword, signToken } from "@/lib/auth";
import { User } from "@/models/User";
import type { JwtPayload } from "@/types/jobs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };
    if (!email?.trim() || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const ok = await verifyPassword(password, user.password);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role as "user" | "admin",
    };
    const token = await signToken(payload);
    return NextResponse.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
