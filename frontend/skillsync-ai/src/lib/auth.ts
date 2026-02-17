import { SignJWT, jwtVerify } from "jose";
import type { JwtPayload } from "@/types/jobs";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET ?? "job-portal-secret-change-in-production";
const secret = new TextEncoder().encode(JWT_SECRET);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export function getAuthFromRequest(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}
