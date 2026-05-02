# InterviewGPT Backend - API Documentation

## Base URL
```
http://localhost:8000
```

## Authentication
All endpoints (except `/auth/signup` and `/auth/login`) require a JWT token in query parameter:
```
?token=your_access_token
```

---

## Authentication Endpoints

### Sign Up
```
POST /auth/signup
Content-Type: application/json

Request:
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password",
  "full_name": "John Doe"
}

Response (200):
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "created_at": "2024-01-20T10:30:00"
}
```

### Login
```
POST /auth/login
Content-Type: application/json

Request:
{
  "email": "john@example.com",
  "password": "secure_password"
}

Response (200):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Get Current User
```
GET /auth/me?token=your_token

Response (200):
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "created_at": "2024-01-20T10:30:00"
}
```

---

## Analysis Endpoints

### Upload Resume
```
POST /analysis/upload-resume
Content-Type: multipart/form-data

Params:
- token: JWT token (query parameter)

Request:
- file: PDF or DOCX file

Response (200):
{
  "id": 1,
  "filename": "resume.pdf",
  "created_at": "2024-01-20T10:35:00"
}
```

### Analyze Resume
```
POST /analysis/analyze?token=your_token
Content-Type: application/json

Request:
{
  "resume_id": 1,
  "job_description": "Looking for a senior Python developer with 5+ years experience..."
}

Response (200):
{
  "id": 1,
  "ats_score": 85.5,
  "missing_skills": "[\"Docker\", \"Kubernetes\", \"AWS\"]",
  "suggestions": "[\"Highlight cloud experience\", \"Add DevOps skills\"]",
  "created_at": "2024-01-20T10:40:00"
}
```

### Get Analysis
```
GET /analysis/analysis/{analysis_id}?token=your_token

Response (200):
{
  "id": 1,
  "ats_score": 85.5,
  "missing_skills": "[\"Docker\", \"Kubernetes\"]",
  "suggestions": "[\"Highlight cloud experience\"]",
  "created_at": "2024-01-20T10:40:00"
}
```

### Generate Interview Questions
```
POST /analysis/generate-questions/{analysis_id}?question_type=hr&token=your_token

Query Params:
- question_type: "hr" | "technical" | "role_specific" | "general"
- token: JWT token

Response (200):
[
  {
    "id": 1,
    "question_type": "hr",
    "question_text": "Tell me about your experience with team collaboration...",
    "model_answer": "I have 5 years of experience working in cross-functional teams...",
    "category": "generated"
  },
  ...
]
```

### Get Interview Questions
```
GET /analysis/questions/{analysis_id}?token=your_token

Response (200):
[
  {
    "id": 1,
    "question_type": "hr",
    "question_text": "Tell me about your experience...",
    "model_answer": "Model answer text...",
    "category": "generated"
  },
  ...
]
```

---

## Chat Endpoints

### Send Message
```
POST /chat/message?analysis_id=1&token=your_token
Content-Type: application/json

Request:
{
  "role": "user",
  "message": "How should I approach this technical question?"
}

Response (200):
{
  "user_message": "How should I approach this technical question?",
  "assistant_message": "Based on the job description and your background..."
}
```

### Get Chat History
```
GET /chat/history/{analysis_id}?token=your_token

Response (200):
[
  {
    "id": 1,
    "role": "user",
    "message": "How should I approach this?",
    "created_at": "2024-01-20T10:45:00"
  },
  {
    "id": 2,
    "role": "assistant",
    "message": "Based on the context...",
    "created_at": "2024-01-20T10:45:05"
  },
  ...
]
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Only PDF and DOCX files are supported"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid token"
}
```

### 404 Not Found
```json
{
  "detail": "Analysis not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Example Workflow

1. **Sign Up**
   ```bash
   curl -X POST http://localhost:8000/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"username":"john","email":"john@example.com","password":"pass","full_name":"John"}'
   ```

2. **Login**
   ```bash
   curl -X POST http://localhost:8000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"john@example.com","password":"pass"}'
   ```

3. **Upload Resume**
   ```bash
   curl -X POST http://localhost:8000/analysis/upload-resume?token=TOKEN \
     -F "file=@resume.pdf"
   ```

4. **Analyze Resume**
   ```bash
   curl -X POST http://localhost:8000/analysis/analyze?token=TOKEN \
     -H "Content-Type: application/json" \
     -d '{"resume_id":1,"job_description":"..."}'
   ```

5. **Generate Questions**
   ```bash
   curl -X POST http://localhost:8000/analysis/generate-questions/1?question_type=hr&token=TOKEN
   ```

6. **Start Chat**
   ```bash
   curl -X POST http://localhost:8000/chat/message?analysis_id=1&token=TOKEN \
     -H "Content-Type: application/json" \
     -d '{"role":"user","message":"How should I approach..."}'
   ```

---

## Rate Limiting

No rate limiting implemented (add for production).

---

## Versioning

Current version: 1.0.0

---

## Support

API Documentation available at `/docs` (Swagger UI)
