import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import { User } from "@/models/User";
import type { JwtPayload } from "@/types/jobs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body as {
      name?: string;
      email?: string;
      password?: string;
    };
    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await connectDB();
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashed = await hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashed,
      role: "user",
      savedJobs: [],
    });

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
    console.error("Register error:", e);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
