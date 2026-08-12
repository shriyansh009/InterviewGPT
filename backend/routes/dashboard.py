import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Query
from sqlalchemy.orm import Session
from database import get_db
from schemas import ResumeResponse, AnalysisRequest, AnalysisResponse
from models import User, Resume, Analysis
from utils.auth import decode_token
from utils.file_processor import save_uploaded_file, extract_resume_text, delete_file
from services.embedding_service import EmbeddingService
from services.rag_service import RAGService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

# Initialize services
embedding_service = EmbeddingService()
rag_service = RAGService(embedding_service)


def get_current_user(token: str = Query(None), db: Session = Depends(get_db)) -> User:
    """Get current user from token"""
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.get("/resumes", response_model=list[ResumeResponse])
def list_resumes(token: str = Query(None), db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    resumes = db.query(Resume).filter(Resume.user_id == user.id).order_by(Resume.created_at.desc()).all()
    return resumes


@router.post("/upload-resume", response_model=ResumeResponse)
async def upload_resume(file: UploadFile = File(...), token: str = Query(None), db: Session = Depends(get_db)):
    user = get_current_user(token, db)

    if not file.filename.lower().endswith((".pdf", ".docx")):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF and DOCX files are supported")

    content = await file.read()
    file_path = save_uploaded_file(content, file.filename)

    try:
        raw_text = extract_resume_text(file_path)
    except Exception as e:
        delete_file(file_path)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error processing file: {str(e)}")

    db_resume = Resume(user_id=user.id, filename=file.filename, file_path=file_path, raw_text=raw_text)
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)

    chunks = embedding_service.split_text(raw_text)
    metadata = [{"text": chunk, "resume_id": db_resume.id, "filename": file.filename} for chunk in chunks]
    embedding_service.add_texts(chunks, metadata)
    return db_resume


@router.delete("/resume/{resume_id}")
def delete_resume(resume_id: int, token: str = Query(None), db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == user.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

    try:
        delete_file(resume.file_path)
    except Exception:
        pass

    db.delete(resume)
    db.commit()
    return {"detail": "Resume deleted"}


@router.post("/analyze", response_model=AnalysisResponse)
def analyze_resume(request: AnalysisRequest, token: str = Query(None), db: Session = Depends(get_db)):
    user = get_current_user(token, db)

    resume = db.query(Resume).filter(Resume.id == request.resume_id, Resume.user_id == user.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

    analysis_result = rag_service.generate_ats_score(resume.raw_text, request.job_description)

    db_analysis = Analysis(
        user_id=user.id,
        resume_id=resume.id,
        job_description=request.job_description,
        ats_score=analysis_result.get("ats_score"),
        missing_skills=json.dumps(analysis_result.get("missing_skills", [])),
        matching_skills=json.dumps(analysis_result.get("matching_skills", [])),
        suggestions=json.dumps(analysis_result.get("suggestions", []))
    )

    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    return db_analysis


@router.get("/analysis/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(analysis_id: int, token: str = Query(None), db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id, Analysis.user_id == user.id).first()
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    return analysis
