# Python Resume Critiquer API

FastAPI backend that replicates the **AI Resume Critiquer** logic from the Streamlit app. Use this if you want to run the NLP in Python instead of the Next.js API.

## Setup

1. **Create a virtual environment and install dependencies**

   ```bash
   cd python-resume-api
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate

   pip install -r requirements.txt
   ```

2. **Configure the API key**

   - Copy `.env.example` to `.env`.
   - In `.env`, set **only the variable name** and put your key as the **value**:

   ```env
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

   **Important:** Do **not** put the key inside `os.getenv("sk-...")` in code. The env var **name** is `OPENAI_API_KEY`; the **value** is your key.

3. **Run the server**

   ```bash
   uvicorn main:app --reload --port 8000
   ```

   - API: http://localhost:8000  
   - Docs: http://localhost:8000/docs  

## API

- **POST /analyze**  
  - **Body:** `multipart/form-data`  
    - `file`: PDF or TXT resume file  
    - `job_role`: (optional) Target job role, e.g. "Senior Frontend Developer"  
  - **Response:** `{ "analysis": "..." }` (narrative feedback)

- **GET /health**  
  - Returns `{ "status": "ok" }`

## Using this from the React/Next.js app

If you run this Python API on port 8000:

1. **Option A – Next.js proxy (recommended)**  
   In `next.config.js` (or `next.config.ts`), add:

   ```js
   async rewrites() {
     return [
       { source: "/api/python-critique", destination: "http://localhost:8000/analyze" },
     ];
   }
   ```

   Then in the frontend, send the resume file + job role to `/api/python-critique` (as multipart). You’ll need a Next.js API route that forwards the request to the Python backend, since rewrites don’t change the request body.

2. **Option B – Call Python API directly**  
   From the browser, call `http://localhost:8000/analyze` with CORS enabled (already set in this FastAPI app for `http://localhost:3000`). Use multipart form: `file` and optional `job_role`.

The **simplest** approach is to use the built-in **Next.js** critique: the app already has **`/api/critique-resume`**, which uses the same prompt and runs in Node (no Python process). Use the Python API only if you specifically need the logic in Python.
