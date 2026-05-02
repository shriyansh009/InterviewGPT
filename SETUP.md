# InterviewGPT - Installation & Setup Guide

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15
- Git

## Quick Start (Local Development)

### 1. Clone and Setup Backend

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

### 2. Setup Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

### 3. Database Setup

Create PostgreSQL database:
```bash
createdb interviewgpt
psql interviewgpt < database/schema.sql
```

Or use Docker:
```bash
docker-compose up -d db
docker-compose exec db psql -U postgres -d interviewgpt -f /dev/stdin < database/schema.sql
```

---

## Docker Setup (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Stop services
docker-compose down
```

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Database: localhost:5432

---

## API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Analysis
- `POST /analysis/upload-resume` - Upload resume
- `POST /analysis/analyze` - Analyze resume
- `GET /analysis/analysis/{id}` - Get analysis
- `POST /analysis/generate-questions/{id}` - Generate interview questions
- `GET /analysis/questions/{id}` - Get questions

### Chat
- `POST /chat/message` - Send chat message
- `GET /chat/history/{id}` - Get chat history

---

## Environment Variables

### Backend (.env)
- `DATABASE_URL` - PostgreSQL connection string
- `GEMINI_API_KEY` - Google Gemini API key
- `SECRET_KEY` - JWT secret key
- `EMBEDDING_MODEL` - Sentence transformer model (default: all-MiniLM-L6-v2)

### Frontend (.env)
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:8000)

---

## Tech Stack

**Backend:**
- FastAPI
- SQLAlchemy
- PostgreSQL
- LangChain
- FAISS
- Sentence Transformers
- Google Gemini API

**Frontend:**
- React 18
- React Router
- Tailwind CSS
- Axios

---

## Features

1. **Resume Upload & Analysis**
   - Upload PDF/DOCX resumes
   - Extract and parse content
   - Generate ATS scores

2. **AI-Powered Interview Prep**
   - Generate HR & technical questions
   - Provide model answers
   - Role-specific preparation

3. **RAG-Based Chat**
   - Context-aware Q&A
   - Interview coaching
   - Real-time responses

4. **User Dashboard**
   - View analyses
   - Track improvements
   - Access chat history

---

## Development

### Running Tests
```bash
cd backend
pytest
```

### Code Quality
```bash
cd backend
black .
flake8 .
```

---

## Troubleshooting

**Database Connection Error**
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env

**Gemini API Error**
- Verify API key is valid
- Check API quota

**File Upload Error**
- Check file format (PDF/DOCX)
- Ensure upload directory exists

---

## Production Deployment

1. Update `SECRET_KEY` in .env
2. Set `DATABASE_URL` to production database
3. Use environment-specific `.env` files
4. Run migrations on production DB
5. Use a production ASGI server (Gunicorn)

```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

---

## Support

For issues or questions, please refer to the documentation or create an issue.
