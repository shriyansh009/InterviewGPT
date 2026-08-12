# 🚀 InterviewGPT – AI Resume Analyzer & Interview Preparation Platform

InterviewGPT is a full-stack AI-powered platform designed to help job seekers optimize their resumes and prepare for interviews effectively. It leverages Retrieval-Augmented Generation (RAG), semantic search, and large language models to provide ATS scoring, skill gap analysis, and personalized interview preparation.

---

## ⚙️ Working

![working image](images/explaination.png)

## 🌟 Features

### 📄 Resume Analyzer

* Upload resumes (PDF/DOCX)
* Extract and analyze content
* Generate **ATS match score**
* Identify missing skills
* Provide actionable improvement suggestions

### 🧠 AI-Powered Interview Assistant

* Generate HR & technical interview questions
* Provide model answers
* Role-specific and company-specific mock interviews
* Interactive chat-based preparation

### 🔍 Semantic Search with RAG

* Context-aware retrieval using FAISS
* Combines resume, job description, and interview datasets
* Improves response relevance using LangChain pipelines

### 📊 Dashboard & Analytics

* View ATS scores and reports
* Track improvements over time
* Save and download analysis reports
* Chat history storage

### 🔐 Authentication System

* Secure login & signup
* User-specific data storage

---

## 🏗️ Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Axios

### Backend

* FastAPI
* Python

### Database

* PostgreSQL
* SQLAlchemy

### AI & ML

* Gemini API (LLM)
* LangChain (RAG pipeline)
* FAISS (vector similarity search)
* HuggingFace Embeddings

---

## 🧩 System Architecture

```
Frontend (React)
        ↓
Backend (FastAPI)
        ↓
AI Layer (Gemini + LangChain + FAISS)
        ↓
Database (PostgreSQL)
```

---

## ⚙️ Installation & Setup

### Quick Start (Local Development)

#### 1️⃣ Backend Setup (FastAPI)

```bash
cd backend
pip install -r requirements.txt
```

Create `.env` file:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/interviewgpt
GEMINI_API_KEY=your_api_key_here
SECRET_KEY=your-secret-key-change-in-production
```

Start backend:
```bash
uvicorn main:app --reload
```

Backend runs on: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

#### 2️⃣ Frontend Setup (React)

```bash
cd frontend
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

#### 3️⃣ Database Setup (PostgreSQL)

Create PostgreSQL database:
```bash
createdb interviewgpt
psql interviewgpt < database/schema.sql
```

---

### Docker Setup (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Stop services
docker-compose down
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Database: localhost:5432

---

### Environment Variables

**Backend (.env)**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/interviewgpt
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
EMBEDDING_MODEL=all-MiniLM-L6-v2
FAISS_INDEX_PATH=./faiss_index
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:8000
```

---

## 🔄 How It Works

1. User uploads a resume and enters a job description
2. System extracts and processes text
3. Embeddings are generated and stored in FAISS
4. ATS score is calculated using semantic similarity
5. Gemini API generates insights and suggestions
6. RAG pipeline enables contextual Q&A and interview prep

---

## 📁 Project Structure

```
interviewgpt/
│
├── backend/
│   ├── main.py
│   ├── routes/
│   ├── models/
│   ├── services/
│   └── utils/
│
├── frontend/
│   ├── src/
│   ├── components/
│   └── pages/
│
├── database/
│   └── schema.sql
│
├── requirements.txt
└── README.md
```

---

