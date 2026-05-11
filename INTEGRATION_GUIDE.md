# Frontend & Backend Integration Guide

## Overview
The frontend and backend are now fully integrated and can run together both in development and production environments.

## Development Setup

### Prerequisites
- Python 3.9+ (for backend)
- Node.js 18+ (for frontend)
- PostgreSQL 15 (can use Docker)

### Running Locally

#### Option 1: Separate Terminals (Recommended for Development)

1. **Start Backend:**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Backend will be available at: `http://localhost:8000`

2. **Start Frontend (in another terminal):**
```bash
cd frontend
npm install
npm run dev
```
Frontend will be available at: `http://localhost:5173`

The frontend automatically proxies API calls to `http://localhost:8000` through the Vite proxy.

#### Option 2: Docker Compose (Full Stack)

```bash
# Build and start all services
docker-compose up --build

# Or just start without rebuilding
docker-compose up
```

Services will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- Database: `localhost:5432`

To stop:
```bash
docker-compose down
```

## API Communication

### Frontend to Backend

The frontend includes an API client (`src/api/client.js`) that handles all backend communication:

```javascript
import { apiClient } from "@/api";

// Sign up
const user = await apiClient.signUp(email, password, fullName);

// Sign in
const auth = await apiClient.signIn(email, password);

// Upload resume
const result = await apiClient.uploadResume(file);

// Analyze resume
const analysis = await apiClient.analyzeResume(fileId);

// Send chat message
const message = await apiClient.sendMessage(userMessage, conversationId);
```

### Using the API Hook

For React components, use the `useAPI` hook:

```javascript
import { useAPI, apiClient } from "@/api";

function MyComponent() {
  const { execute, loading, error } = useAPI();

  const handleUpload = async (file) => {
    try {
      const result = await execute(() => apiClient.uploadResume(file));
      console.log("Upload successful:", result);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  return (
    <button onClick={() => handleUpload(file)} disabled={loading}>
      {loading ? "Uploading..." : "Upload Resume"}
    </button>
  );
}
```

## Environment Variables

### Frontend Development (`.env.local`)
```
VITE_API_URL=http://localhost:8000
```

### Frontend Production (`.env.production`)
```
VITE_API_URL=/api
```

### Backend Configuration (`.env`)
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/interviewgpt
GEMINI_API_KEY=your-key-here
SECRET_KEY=your-secret-key-here
```

## CORS Configuration

The backend is configured with CORS middleware to accept requests from any origin during development. For production, update the allowed origins in `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Restrict to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Production Deployment

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Serve the built frontend through the backend (add this to `backend/main.py`):
```python
from fastapi.staticfiles import StaticFiles

app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="frontend")
```

3. Deploy using Docker Compose or your preferred hosting platform.

## File Structure

```
InterviewGPT/
├── frontend/
│   ├── src/
│   │   ├── api/              # API client and hooks
│   │   │   ├── client.js     # API client
│   │   │   ├── useAPI.js     # React hook for API calls
│   │   │   └── index.js      # Exports
│   │   ├── pages/            # React pages
│   │   ├── widgets/          # React components
│   │   └── ...
│   ├── .env.local            # Development env
│   ├── .env.production       # Production env
│   ├── vite.config.js        # Vite config with proxy
│   ├── Dockerfile            # Docker build
│   └── package.json
│
├── backend/
│   ├── main.py               # FastAPI app
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   ├── models/               # Database models
│   ├── requirements.txt
│   ├── Dockerfile
│   └── ...
│
├── docker-compose.yml        # Full stack orchestration
└── ...
```

## Troubleshooting

### Frontend can't reach backend
- Check that backend is running on `http://localhost:8000`
- Verify `.env.local` has `VITE_API_URL=http://localhost:8000`
- Check browser console for CORS errors

### Docker services not communicating
- Use `http://backend:8000` inside Docker (internal networking)
- Use `http://localhost:8000` from your local machine

### Port conflicts
- Backend: Change port in uvicorn command (default: 8000)
- Frontend: Change port in `npm run dev` (default: 5173)
- Update `.env.local` accordingly

### Rebuild needed
```bash
docker-compose down
docker-compose up --build
```
