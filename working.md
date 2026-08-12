# InterviewGPT Working System

## Overview
InterviewGPT is a full-stack AI resume analysis and interview preparation application.
It includes a React frontend, a FastAPI backend, a PostgreSQL database, and an AI pipeline for resume analysis, question generation, and conversational chat.

## Goal
Provide job seekers with:
- Resume upload and extraction
- ATS-style analysis and score
- Skill matching and gap recommendations
- Role-based interview question generation
- Resume-grounded AI chat support
- Saved chat history and analysis records

---

## System Components

### 1. Frontend
Location: `frontend/`

Responsibilities:
- User authentication pages
- Resume upload and dashboard UI
- Analysis results and interview prep UI
- Chat UI with markdown rendering
- API calls to backend routes

Key pages:
- `frontend/src/pages/dashboard.jsx` — resume upload, resume list, job description input, analysis trigger
- `frontend/src/pages/analysis.jsx` — display ATS score, matching skills, missing skills, suggestions, interview questions, chat interface
- `frontend/src/pages/sign-in.jsx` and `frontend/src/pages/sign-up.jsx` — auth flows

API integration:
- Uses `localStorage` token under `auth_token`
- Sends token as query parameter `?token=...` to backend endpoints
- Uses `import.meta.env.VITE_API_URL` or `http://localhost:8000`

### 2. Backend
Location: `backend/`

Responsibilities:
- Authentication
- Resume upload and text extraction
- Analysis generation
- Interview question generation
- Chat message handling
- Database persistence
- Embeddings and retrieval

Important files:
- `backend/main.py` — FastAPI app setup and route registration
- `backend/routes/auth.py` — signup, login, JWT authentication
- `backend/routes/analysis.py` — resume upload, analyze resume, fetch analysis, generate questions
- `backend/routes/chat.py` — send chat messages and fetch chat history
- `backend/routes/dashboard.py` — dashboard resume listing, delete, analyze endpoints
- `backend/services/embedding_service.py` — FAISS embedding index management
- `backend/services/rag_service.py` — Gemini LLM prompts and RAG logic
- `backend/utils/auth.py` — password hashing and JWT handling
- `backend/utils/file_processor.py` — PDF/DOCX text extraction
- `backend/schemas.py` — Pydantic request/response schemas
- `backend/models/__init__.py` — SQLAlchemy database models

### 3. Database
Location: `database/schema.sql`

Stores:
- `users` — accounts
- `resumes` — uploaded resume metadata and extracted raw text
- `analyses` — generated ATS score, missing skills, matching skills, suggestions
- `interview_questions` — generated practice questions and answers
- `chat_histories` — saved conversation messages

---

## How Each Part Works

### A. Authentication

Frontend:
- User signs up or logs in through `sign-in.jsx` / `sign-up.jsx`
- Successful login stores `auth_token` in browser `localStorage`

Backend:
- `backend/routes/auth.py` validates credentials and issues JWT tokens
- `backend/utils/auth.py` hashes passwords and verifies them
- `decode_token()` checks token validity on protected endpoints

Flow:
1. User submits email/password
2. Backend verifies and returns JWT
3. Frontend stores token
4. Future API requests include `?token=...`

### B. Resume Upload

Frontend:
- `dashboard.jsx` handles drag/drop and file input
- Sends file via POST to `/dashboard/upload-resume?token=...`

Backend:
- `backend/routes/dashboard.py` and `backend/routes/analysis.py` both expose `/upload-resume`
- `upload_resume()` saves the file and extracts text
- Extracted raw resume text is stored in the `resumes` table
- Resume text is split into chunks and indexed by FAISS

AI store:
- `backend/services/embedding_service.py` uses `SentenceTransformer`
- Chunks are encoded and added to FAISS index
- Metadata for each chunk is saved for later retrieval

### C. Resume Analysis

Frontend:
- The dashboard sends POST to `/dashboard/analyze?token=...` with `resume_id` and `job_description`
- On success, the user is redirected to `/analysis/{analysis_id}`

Backend:
- `backend/routes/analysis.py` or `backend/routes/dashboard.py` accepts the analyze request
- The resume raw text and job description are passed to `rag_service.generate_ats_score()`
- The result includes:
  - `ats_score`
  - `missing_skills`
  - `matching_skills`
  - `suggestions`
- These values are stored in the `analyses` table
- `AnalysisResponse` now returns `matching_skills` correctly

Why it works:
- `RAGService.generate_ats_score()` uses Gemini prompts to compare resume content to the job description
- The returned JSON is parsed and persisted
- The frontend loads the analysis record and renders the skill lists

### D. Interview Question Generation

Frontend:
- `analysis.jsx` has a UI button to generate questions for `technical`, `behavioral`, or `hr`
- Requests POST to `/analysis/generate-questions/{analysis_id}?question_type=...&token=...`

Backend:
- `backend/routes/analysis.py` handles question generation
- It retrieves the analysis and resume text
- Calls `rag_service.generate_interview_questions()`
- Response is saved as `InterviewQuestion` rows
- Returned data is rendered as expandable questions with model answers

### E. Chat and RAG Conversation

Frontend:
- `analysis.jsx` has a chat UI in the right-hand panel
- When the user opens the Chat tab, it fetches history from `/chat/history?analysis_id={analysisId}&token=...`
- User messages POST to `/chat/message?analysis_id={analysisId}&token=...`
- Assistant replies are rendered with `react-markdown`

Backend:
- `backend/routes/chat.py` saves user messages to `chat_histories`
- If an `analysis_id` is present, it loads the resume and job description context
- Calls `rag_service.generate_contextual_answer()` with:
  - user question
  - resume raw text
  - job description
  - system prompt instructions
- Saves AI response back to `chat_histories`
- Response returns `assistant_message`

RAG logic:
- `backends/services/rag_service.py` uses FAISS search to retrieve top-k relevant text
- It builds a prompt containing retrieved context and explicit context
- The Gemini LLM generates a concise answer grounded in resume/job-description content
- The `RESPONSE_STYLE_PROMPT` enforces short, readable answers with resume awareness

### F. Embeddings and Search

- `EmbeddingService` loads or creates a FAISS index on startup
- `split_text()` breaks resume text into overlapping chunks
- `generate_embeddings()` converts text chunks into vector embeddings
- `add_texts()` adds embeddings into FAISS and saves index + metadata
- `search()` finds similar resume passages for a user query

This enables the chat assistant to answer using resume content rather than only using prompt memory.

---

## Important Routes

### Auth
- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`

### Resume / Dashboard
- `POST /dashboard/upload-resume`
- `GET /dashboard/resumes`
- `DELETE /dashboard/resume/{resume_id}`
- `POST /dashboard/analyze`

### Analysis
- `POST /analysis/upload-resume`
- `POST /analysis/analyze`
- `GET /analysis/{analysis_id}`
- `POST /analysis/generate-questions/{analysis_id}`
- `GET /analysis/questions/{analysis_id}`

### Chat
- `POST /chat/message`
- `GET /chat/history`

---

## Running the System

### Backend
1. Open terminal in `backend/`
2. Install packages: `pip install -r requirements.txt`
3. Create database and schema from `database/schema.sql`
4. Configure `.env` with `DATABASE_URL`, `GEMINI_API_KEY`, `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `EMBEDDING_MODEL`, `FAISS_INDEX_PATH`, `UPLOAD_DIR`
5. Run: `uvicorn main:app --reload`

### Frontend
1. Open terminal in `frontend/`
2. Install packages: `npm install`
3. Run: `npm run dev`

### Live URLs
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

---

## What Is Working Now

- Resume upload and text extraction
- FAISS embedding storage and retrieval
- Resume analysis with ATS score and skill match / gap detection
- Interview question generation from resume + JD
- Chat history storage and retrieval
- Resume-grounded answer generation via RAG
- Frontend markdown rendering for AI assistant replies
- JWT-based auth and protected routes

## What to Check If Something Fails

- Ensure `auth_token` is present in localStorage
- Ensure the backend is reading the correct `.env` settings
- Confirm the FAISS index folder exists and is writable
- Verify the resume was correctly extracted and saved as `raw_text`
- Confirm `matching_skills` appears in the analysis response
- If chat returns unrelated content, check that `analysis_id` and resume context are passed correctly

---

## Notes

- `matching_skills` must be returned by the backend schema to appear in the frontend list.
- `analysis.jsx` parses JSON strings for `matching_skills`, `missing_skills`, and `suggestions` before rendering.
- `chat/history` loads history only when the chat tab is selected.
- `chat/message` saves both user and assistant lines to the database for persistence.

---

## Recommended Improvements

If you extend this app, the next enhancements are:
- Add backend token header support instead of query token
- Add explicit resume preview and parsed section display
- Add authenticated user profile management
- Add a dedicated chat page with persistent multi-session conversations
- Add unit tests for prompt parsing and response schema
