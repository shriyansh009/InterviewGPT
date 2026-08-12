from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List


# User Schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# Resume Schemas
class ResumeCreate(BaseModel):
    filename: str


class ResumeResponse(BaseModel):
    id: int
    filename: str
    created_at: datetime

    class Config:
        from_attributes = True


# Analysis Schemas
class AnalysisRequest(BaseModel):
    resume_id: int
    job_description: str


class AnalysisResponse(BaseModel):
    id: int
    ats_score: Optional[float]
    missing_skills: Optional[str]
    matching_skills: Optional[str]
    suggestions: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# Interview Question Schemas
class InterviewQuestionResponse(BaseModel):
    id: int
    question_type: str
    question_text: str
    model_answer: Optional[str]
    category: str

    class Config:
        from_attributes = True


# Chat Schemas
class ChatMessage(BaseModel):
    role: str
    message: str
    analysis_id: Optional[int] = None


class ChatHistoryResponse(BaseModel):
    id: int
    role: str
    message: str
    analysis_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Auth Schemas
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
