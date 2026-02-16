import { NextResponse } from "next/server";

const ATS_BACKEND_BASE = (process.env.NEXT_PUBLIC_ATS_API_URL || "http://127.0.0.1:5000").replace(
  /\/$/,
  ""
);

/** GET /api/ats-match/health — Check if ATS backend is running */
export async function GET() {
  try {
    const res = await fetch(`${ATS_BACKEND_BASE}/health`, {
      method: "GET",
      cache: "no-store",
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false }, { status: 503 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
