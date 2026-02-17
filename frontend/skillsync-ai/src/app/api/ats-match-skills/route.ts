import { NextRequest, NextResponse } from "next/server";

const ATS_BACKEND_BASE = (process.env.NEXT_PUBLIC_ATS_API_URL || "http://127.0.0.1:5000").replace(
  /\/$/,
  ""
);

/**
 * Proxies POST /api/ats-match-skills to the Node/Express ATS backend.
 * Accepts requiredSkills array directly (for job roles dropdown).
 */
export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Request must be multipart/form-data" },
      { status: 400 }
    );
  }

  try {
    const body = await req.arrayBuffer();
    const res = await fetch(`${ATS_BACKEND_BASE}/api/ats-match-skills`, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
      },
      body,
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || "ATS request failed" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          "ATS backend is not running. Open a terminal and run: cd backend && npm start (then keep it open).",
      },
      { status: 503 }
    );
  }
}
