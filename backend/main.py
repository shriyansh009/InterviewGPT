from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import init_db
from routes import auth, analysis, chat

# Initialize database
init_db()

# Create FastAPI app
app = FastAPI(
    title="InterviewGPT API",
    description="AI Resume Analyzer & Interview Preparation Platform",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(auth.router)
app.include_router(analysis.router)
app.include_router(chat.router)


@app.get("/")
def root():
    """Welcome endpoint"""
    return {
        "message": "Welcome to InterviewGPT API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
