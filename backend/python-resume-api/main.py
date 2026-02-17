"""
AI Resume Critiquer - FastAPI backend.
Same logic as the Streamlit app; call from React via POST /analyze.
"""
import io
import os
from pathlib import Path
from typing import Optional

import PyPDF2
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI

# Load .env from this script's directory so it works regardless of cwd
load_dotenv(Path(__file__).resolve().parent / ".env")

app = FastAPI(title="AI Resume Critiquer API", version="1.0.0")

# Allow React/Next.js to call this API (adjust origins in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use the env var NAME (e.g. OPENAI_API_KEY), not the key value inside getenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("Warning: OPENAI_API_KEY not set. Set it in .env to use the critique API.")


def extract_text_from_pdf(file_content: bytes) -> str:
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() or ""
        text += "\n"
    return text.strip()


def extract_text_from_file(file: UploadFile, content: bytes) -> str:
    content_type = (file.content_type or "").lower()
    filename = (file.filename or "").lower()
    if content_type == "application/pdf" or filename.endswith(".pdf"):
        return extract_text_from_pdf(content)
    if "text" in content_type or filename.endswith(".txt"):
        return content.decode("utf-8", errors="replace")
    # Fallback: try PDF first (some clients send wrong content-type), then text
    try:
        return extract_text_from_pdf(content)
    except Exception:
        return content.decode("utf-8", errors="replace")


@app.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    job_role: Optional[str] = Form(None),
):
    """
    Upload a resume (PDF or TXT) and optional job role.
    Returns AI-powered narrative feedback (same as the Streamlit critiquer).
    """
    if not OPENAI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="OPENAI_API_KEY is not configured. Add it to .env.",
        )

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="File is empty.")

    try:
        file_content = extract_text_from_file(file, content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read file: {e}") from e

    if not file_content.strip():
        raise HTTPException(
            status_code=400,
            detail="File does not contain extractable text (e.g. image-only PDF).",
        )

    prompt = f"""Please analyze this resume and provide constructive feedback.
Focus on the following aspects:
1. Content clarity and impact
2. Skills presentation
3. Experience description
4. Specific improvements for {job_role if job_role else 'general job applications'}

Resume content:
{file_content[:14000]}

Please provide your analysis in a clear, structured format with specific recommendations."""

    try:
        client = OpenAI(api_key=OPENAI_API_KEY.strip())
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert resume reviewer with years of experience in HR and recruitment.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=1000,
        )
        analysis = response.choices[0].message.content or ""
    except Exception as e:
        err_msg = str(e).strip() or "Unknown error"
        if "401" in err_msg or "invalid_api_key" in err_msg.lower() or "incorrect API key" in err_msg.lower():
            raise HTTPException(
                status_code=503,
                detail="Invalid OpenAI API key. Check OPENAI_API_KEY in python-resume-api/.env",
            ) from e
        raise HTTPException(status_code=502, detail=f"AI service error: {err_msg}") from e

    return {"analysis": analysis}


@app.get("/health")
async def health():
    return {"status": "ok"}
