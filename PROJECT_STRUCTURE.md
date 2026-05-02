# 📁 Project Structure

```
InterviewAI/
│
├── backend/                          # FastAPI Backend
│   ├── main.py                      # Application entry point
│   ├── config.py                    # Configuration settings
│   ├── database.py                  # Database connection & setup
│   ├── schemas.py                   # Pydantic validation models
│   ├── requirements.txt             # Python dependencies
│   ├── .env.example                 # Environment template
│   ├── Dockerfile                   # Docker configuration
│   ├── .gitignore
│   │
│   ├── models/
│   │   └── __init__.py             # SQLAlchemy ORM models
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py                 # Authentication endpoints
│   │   ├── analysis.py             # Resume analysis endpoints
│   │   └── chat.py                 # Chat endpoints
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── embedding_service.py    # FAISS & embeddings
│   │   └── rag_service.py          # RAG pipeline with Gemini
│   │
│   └── utils/
│       ├── __init__.py
│       ├── auth.py                 # JWT & password utilities
│       └── file_processor.py       # PDF/DOCX text extraction
│
├── frontend/                         # React Frontend
│   ├── package.json                # NPM dependencies
│   ├── tailwind.config.js          # Tailwind CSS config
│   ├── Dockerfile                  # Docker configuration
│   ├── .env.example                # Environment template
│   ├── .gitignore
│   │
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   │
│   └── src/
│       ├── index.js                # React entry point
│       ├── index.css               # Global styles
│       ├── App.jsx                 # Main app component
│       ├── api.js                  # Axios configuration
│       │
│       ├── pages/
│       │   ├── Home.jsx            # Landing page
│       │   ├── SignUp.jsx          # Registration
│       │   ├── Login.jsx           # Authentication
│       │   ├── Dashboard.jsx       # Resume upload & management
│       │   ├── Analysis.jsx        # ATS results & questions
│       │   └── Chat.jsx            # Interview chat
│       │
│       └── components/             # Reusable components (future)
│
├── database/
│   └── schema.sql                  # PostgreSQL schema
│
├── docker-compose.yml              # Multi-container setup
├── SETUP.md                        # Installation guide
├── ARCHITECTURE.md                 # System architecture
├── API_DOCS.md                     # API reference
└── readme.md                       # Project overview
```

---

## 📊 Key Files Explanation

### Backend

**main.py**
- FastAPI application setup
- Route registration
- CORS middleware
- Database initialization

**config.py**
- Settings management with Pydantic
- Environment variable loading
- Configuration caching

**database.py**
- SQLAlchemy engine setup
- Session management
- Base model for ORM

**schemas.py**
- Pydantic models for request/response validation
- Type hints for API contracts

**models/__init__.py**
- SQLAlchemy ORM models
- User, Resume, Analysis, InterviewQuestion, ChatHistory

**services/embedding_service.py**
- FAISS index management
- Sentence transformer embeddings
- Text chunking and similarity search

**services/rag_service.py**
- LangChain RAG pipeline
- Gemini API integration
- ATS scoring logic
- Question generation
- Contextual answer generation

**routes/auth.py**
- User registration and login
- JWT token generation
- User profile retrieval

**routes/analysis.py**
- Resume upload handling
- Resume analysis
- Interview question generation
- Question retrieval

**routes/chat.py**
- Chat message handling
- RAG-based responses
- Chat history retrieval

**utils/auth.py**
- Password hashing (bcrypt)
- JWT token creation and decoding

**utils/file_processor.py**
- PDF text extraction
- DOCX text extraction
- File upload handling

### Frontend

**App.jsx**
- Main component wrapper
- Route definitions
- Private route protection

**pages/Home.jsx**
- Landing page
- Feature showcase
- Sign up/login navigation

**pages/SignUp.jsx**
- User registration form
- Form validation
- API integration

**pages/Login.jsx**
- User authentication
- Token storage
- Redirect to dashboard

**pages/Dashboard.jsx**
- Resume upload interface
- Resume list management
- Job description input
- Analysis trigger

**pages/Analysis.jsx**
- ATS score display
- Missing skills display
- Suggestions presentation
- Interview question generation
- Question display with model answers

**pages/Chat.jsx**
- Message input
- Chat history display
- Real-time messaging
- Auto-scroll to latest message

**api.js**
- Axios instance configuration
- Request/response interceptors
- Token management
- Error handling

---

## 🗄️ Database Schema

### users
- id (PK)
- username (unique)
- email (unique)
- hashed_password
- full_name
- created_at
- updated_at

### resumes
- id (PK)
- user_id (FK)
- filename
- file_path
- raw_text
- created_at
- updated_at

### analyses
- id (PK)
- user_id (FK)
- resume_id (FK)
- job_description
- ats_score
- missing_skills (JSON)
- suggestions (JSON)
- created_at
- updated_at

### interview_questions
- id (PK)
- analysis_id (FK)
- question_type
- question_text
- model_answer
- category
- created_at

### chat_histories
- id (PK)
- user_id (FK)
- analysis_id (FK)
- role
- message
- created_at

---

## 🔧 Tech Stack Details

### Backend Dependencies
- **FastAPI**: Web framework
- **SQLAlchemy**: ORM
- **psycopg2**: PostgreSQL adapter
- **Pydantic**: Data validation
- **LangChain**: RAG framework
- **langchain-google-genai**: Gemini integration
- **FAISS**: Vector search
- **sentence-transformers**: Embeddings
- **PyPDF**: PDF processing
- **python-docx**: DOCX processing
- **bcrypt**: Password hashing
- **python-jose**: JWT handling

### Frontend Dependencies
- **React**: UI library
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Tailwind CSS**: Styling

---

## 📈 Data Processing Pipeline

### Resume Upload
1. User selects PDF/DOCX file
2. File uploaded to backend
3. Content extracted and stored
4. Raw text saved to database

### Analysis
1. Resume text + Job description → Gemini API
2. ATS score calculated
3. Missing skills identified
4. Suggestions generated
5. Results saved to analyses table

### Question Generation
1. Resume + Job description → Gemini API
2. Questions generated based on type
3. Model answers provided
4. Stored in interview_questions table

### Chat
1. User message sent to backend
2. Context retrieved from analysis
3. LangChain RAG pipeline processes message
4. Gemini generates contextual response
5. Response saved and returned

---

## 🚀 Deployment Architecture

### Development
- Local PostgreSQL
- FastAPI development server
- React dev server

### Docker
- PostgreSQL container
- FastAPI container
- React build container
- Docker network for service communication

### Production Ready
- RDS PostgreSQL
- Load balanced backend
- CDN for frontend
- HTTPS/SSL
- Environment-specific configs
