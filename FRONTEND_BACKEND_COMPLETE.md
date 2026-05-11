# Frontend & Backend Integration - Complete Setup Guide

## ✅ What's Been Integrated

### Frontend Enhancements
1. **API Client** (`src/api/client.js`) - Handles all backend communication
2. **React Hook** (`src/api/useAPI.js`) - State management for API calls
3. **Auth Context** (`src/context/AuthContext.jsx`) - Global auth state
4. **Protected Routes** (`src/components/ProtectedRoute.jsx`) - Route protection
5. **Sign-In Page** - Full backend integration with validation
6. **Sign-Up Page** - Complete registration form with API calls
7. **Environment Config** - Separate dev/prod configurations

### Backend Ready for Requests
The backend has the following endpoints ready:
- `POST /auth/register` - User registration
- `POST /auth/login` - User login  
- `POST /analysis/upload` - Upload resume
- `POST /analysis/analyze` - Analyze resume
- `GET /analysis/{analysisId}` - Get analysis results
- `POST /chat/message` - Send chat message
- `GET /chat/conversations` - Get conversations

## 🚀 Starting the System

### Option 1: Local Development (Recommended)

#### Step 1: Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Step 2: Set Up Environment
Create `.env` in backend folder:
```
DATABASE_URL=postgresql://user:password@localhost:5432/interviewgpt
GEMINI_API_KEY=your-key-here
SECRET_KEY=your-secret-key
```

#### Step 3: Start Backend (Terminal 1)
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
✓ Backend runs on: `http://localhost:8000`

#### Step 4: Install Frontend Dependencies (Terminal 2)
```bash
cd frontend
npm install
```

#### Step 5: Start Frontend (Terminal 2)
```bash
npm run dev
```
✓ Frontend runs on: `http://localhost:5173`
✓ Automatically proxies API calls to `http://localhost:8000`

### Option 2: Docker Compose (Full Stack)

```bash
# Build and start everything
docker-compose up --build

# Or just start
docker-compose up
```

Services:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Database: `localhost:5432`

### Option 3: Helper Scripts

**Windows:**
```bash
start-dev.bat
```

**Linux/Mac:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

## 🔐 Authentication Flow

### Sign Up
1. User fills form (name, email, password)
2. Frontend calls `apiClient.signUp()`
3. Backend creates user & returns auth token
4. Frontend redirects to sign-in

### Sign In
1. User enters email & password
2. Frontend calls `apiClient.signIn()`
3. Backend validates & returns token
4. Frontend stores token in localStorage
5. User can access protected pages

### Protected Pages
- `/dashboard` - Requires login
- `/profile` - Requires login
- `/home` - Public
- `/sign-in` - Public
- `/sign-up` - Public

## 📝 File Structure

```
frontend/
├── src/
│   ├── api/                 # API Integration
│   │   ├── client.js        # API Client
│   │   ├── useAPI.js        # React Hook
│   │   └── index.js
│   ├── context/             # Global State
│   │   └── AuthContext.jsx  # Auth Provider
│   ├── components/          # Reusable Components
│   │   └── ProtectedRoute.jsx
│   ├── pages/               # Page Components
│   │   ├── sign-in.jsx      # ✨ Connected to API
│   │   ├── sign-up.jsx      # ✨ Connected to API
│   │   ├── dashboard.jsx
│   │   └── ...
│   ├── App.jsx              # ✨ Updated with Auth
│   └── main.jsx
├── .env.local               # Dev Config
├── .env.production          # Prod Config
└── vite.config.js           # ✨ With Proxy

backend/
├── main.py                  # FastAPI App
├── routes/
│   ├── auth.py              # Auth Endpoints
│   ├── analysis.py          # Analysis Endpoints
│   └── chat.py              # Chat Endpoints
├── services/                # Business Logic
├── models/                  # DB Models
├── requirements.txt         # Dependencies
└── .env                     # Config
```

## 🐛 Troubleshooting

### Backend Won't Start (Exit Code 1)

**Issue: Database Connection Error**
```
Solution:
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in .env
3. Verify credentials
4. Run: python -c "import sqlalchemy; print('OK')"
```

**Issue: Missing Dependencies**
```bash
pip install -r requirements.txt
# Or reinstall:
pip install --upgrade --force-reinstall -r requirements.txt
```

**Issue: Port Already in Use**
```bash
# Kill process on port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:8000 | xargs kill -9
```

### Frontend Can't Reach Backend

**Check:**
1. Backend is running on port 8000
2. `.env.local` has `VITE_API_URL=http://localhost:8000`
3. Browser console for CORS errors
4. Network tab shows API requests going to correct URL

### Docker Issues

```bash
# Rebuild everything
docker-compose down
docker-compose up --build

# Check logs
docker-compose logs backend
docker-compose logs frontend
```

## 🔄 Using the API in Components

### Direct Calls
```javascript
import { apiClient } from "@/api";

// Sign In
const result = await apiClient.signIn(email, password);

// Upload Resume
const upload = await apiClient.uploadResume(file);

// Send Chat Message
const msg = await apiClient.sendMessage(text, conversationId);
```

### With Hook (Recommended)
```javascript
import { useAPI, apiClient } from "@/api";

function MyComponent() {
  const { execute, loading, error } = useAPI();

  const handleAction = async () => {
    try {
      const result = await execute(() => apiClient.someMethod());
      // Use result
    } catch (err) {
      // Handle error
    }
  };

  return (
    <button onClick={handleAction} disabled={loading}>
      {loading ? "Loading..." : "Click Me"}
    </button>
  );
}
```

### With Auth Context
```javascript
import { useAuth } from "@/context/AuthContext";

function LoginPage() {
  const { login, loading, error } = useAuth();

  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      // Redirect happens automatically
    } catch (err) {
      console.error(err);
    }
  };

  return (
    // Your JSX
  );
}
```

## 📊 Environment Variables

### Frontend Development (`.env.local`)
```
# Use backend on local machine
VITE_API_URL=http://localhost:8000
```

### Frontend Production (`.env.production`)
```
# Use relative path (backend serves both)
VITE_API_URL=/api
```

### Backend (`.env`)
```
DATABASE_URL=postgresql://user:password@host:5432/db
GEMINI_API_KEY=your-key
SECRET_KEY=change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
EMBEDDING_MODEL=all-MiniLM-L6-v2
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

## ✨ Key Features

✅ **Automatic CORS** - Backend allows all origins in dev
✅ **Token Management** - Auto-stores & sends JWT
✅ **Request Proxying** - Vite proxy in dev, relative paths in prod
✅ **Error Handling** - Centralized error messages
✅ **Loading States** - Easy loading indicators
✅ **Protected Routes** - Auto-redirects unauthorized users
✅ **Form Validation** - Client-side validation
✅ **Docker Ready** - Full containerization

## 🚢 Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
# Creates: dist/ folder
```

### Serve Frontend from Backend
```python
# In backend/main.py, add:
from fastapi.staticfiles import StaticFiles

app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="frontend")
```

### Deploy
1. Set production environment variables
2. Build frontend
3. Deploy backend + frontend together
4. Restrict CORS to your domain

## 📞 API Response Format

### Success
```json
{
  "access_token": "eyJ0eXAi...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

### Error
```json
{
  "detail": "Invalid credentials"
}
```

## 🎯 Next Steps

1. ✅ Test sign-up: Go to `http://localhost:5173/sign-up`
2. ✅ Test sign-in: Go to `http://localhost:5173/sign-in`
3. ✅ Check API calls in browser Network tab
4. ✅ Update other pages to use API
5. ✅ Implement resume upload feature
6. ✅ Connect chat functionality

## 📚 Resources

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Router](https://reactrouter.com/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Material Tailwind](https://www.material-tailwind.com/)

---

**Last Updated:** May 11, 2026
**Status:** ✅ Fully Integrated
