# InterviewGPT Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (3000)                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Home | Dashboard | Analysis | Chat Pages            │   │
│  │ Tailwind CSS Styling                                │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ Axios HTTP Requests
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               FastAPI Backend (8000)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Routes:                                              │  │
│  │ ├─ /auth - Authentication (JWT)                     │  │
│  │ ├─ /analysis - Resume Analysis & ATS                │  │
│  │ └─ /chat - AI Chat with RAG                         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Services:                                            │  │
│  │ ├─ RAGService (Gemini + LangChain)                  │  │
│  │ └─ EmbeddingService (FAISS + Sentence Transformers) │  │
│  └──────────────────────────────────────────────────────┘  │
└────────┬─────────────────────────────────────────┬──────────┘
         │                                         │
         ▼                                         ▼
   ┌──────────────┐                         ┌─────────────────┐
   │ PostgreSQL   │                         │ FAISS Index     │
   │ Database     │                         │ + Embeddings    │
   └──────────────┘                         └─────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              External Services                              │
│  ├─ Google Gemini API (LLM)                                │
│  └─ HuggingFace (Embeddings)                               │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### Frontend (React)
- **Pages**: Home, SignUp, Login, Dashboard, Analysis, Chat
- **Components**: Reusable UI components
- **API Layer**: Axios interceptor for token management
- **Styling**: Tailwind CSS

### Backend (FastAPI)
- **main.py**: Application entry point, route registration
- **routes/**: API endpoints (auth, analysis, chat)
- **services/**: Business logic
  - RAGService: ATS scoring, question generation
  - EmbeddingService: Text embeddings and FAISS indexing
- **models/**: SQLAlchemy ORM models
- **schemas/**: Pydantic validation schemas
- **utils/**: Helper functions (auth, file processing)

### Database (PostgreSQL)
- Users: User accounts and credentials
- Resumes: Uploaded resume files and extracted text
- Analyses: ATS scores and analysis results
- InterviewQuestions: Generated questions and model answers
- ChatHistories: Chat messages and conversations

### AI/ML Stack
- **LangChain**: RAG pipeline orchestration
- **Gemini API**: Language model for generation
- **FAISS**: Vector similarity search
- **Sentence Transformers**: Text embeddings (all-MiniLM-L6-v2)

## Data Flow

### Resume Analysis Flow
```
1. User uploads resume (PDF/DOCX)
   ↓
2. File processor extracts text
   ↓
3. RAGService generates embeddings
   ↓
4. FAISS stores embeddings
   ↓
5. Gemini API analyzes against job description
   ↓
6. ATS score + missing skills + suggestions saved
   ↓
7. Results displayed in Analysis page
```

### Interview Preparation Flow
```
1. User selects analysis and question type
   ↓
2. RAGService queries Gemini for questions
   ↓
3. Questions are paired with model answers
   ↓
4. Questions stored in database
   ↓
5. Displayed in interview prep section
```

### Chat Flow
```
1. User sends message in chat
   ↓
2. Message saved to chat history
   ↓
3. RAGService retrieves context from analysis
   ↓
4. Gemini generates contextual response using RAG
   ↓
5. Response saved and displayed
```

## Authentication Flow

```
1. User signs up with email/password
   ↓
2. Password hashed with bcrypt
   ↓
3. User created in database
   ↓
4. User logs in with email/password
   ↓
5. Credentials verified
   ↓
6. JWT token generated
   ↓
7. Token stored in localStorage
   ↓
8. Token sent with each API request
   ↓
9. Backend verifies token (decode_token)
```

## Deployment Architecture

### Local Development
- Frontend: http://localhost:3000 (npm start)
- Backend: http://localhost:8000 (uvicorn)
- Database: localhost:5432

### Docker Compose
- Frontend container
- Backend container
- PostgreSQL container
- All services networked via docker-compose

### Production Considerations
- Use environment-specific .env files
- PostgreSQL hosted on cloud (AWS RDS, etc.)
- FAISS index stored in persistent volume
- Backend behind reverse proxy (Nginx)
- Frontend static files on CDN

## Security Measures

1. **Authentication**: JWT tokens with expiration
2. **Password**: Bcrypt hashing
3. **File Upload**: Type validation, size limits
4. **CORS**: Configured for frontend origin
5. **Environment Variables**: Sensitive data not in code
6. **SQL Injection**: Protected via SQLAlchemy ORM
