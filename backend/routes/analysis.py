import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Query
from sqlalchemy.orm import Session
from database import get_db
from schemas import ResumeResponse, AnalysisRequest, AnalysisResponse, InterviewQuestionResponse
from models import User, Resume, Analysis, InterviewQuestion
from utils.auth import decode_token
from utils.file_processor import save_uploaded_file, extract_resume_text, delete_file
from services.embedding_service import EmbeddingService
from services.rag_service import RAGService

router = APIRouter(prefix="/analysis", tags=["analysis"])

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


@router.post("/upload-resume", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    token: str = Query(None),
    db: Session = Depends(get_db)
):
    """Upload resume file"""
    
    user = get_current_user(token, db)
    
    # Validate file type
    if not file.filename.lower().endswith((".pdf", ".docx")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and DOCX files are supported"
        )
    
    # Read file content
    content = await file.read()
    
    # Save file
    file_path = save_uploaded_file(content, file.filename)
    
    # Extract text
    try:
        raw_text = extract_resume_text(file_path)
    except Exception as e:
        delete_file(file_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error processing file: {str(e)}"
        )
    
    # Save to database
    db_resume = Resume(
        user_id=user.id,
        filename=file.filename,
        file_path=file_path,
        raw_text=raw_text
    )
    
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    
    return db_resume


@router.post("/analyze", response_model=AnalysisResponse)
def analyze_resume(
    request: AnalysisRequest,
    token: str = Query(None),
    db: Session = Depends(get_db)
):
    user = get_current_user(token, db)

    resume = db.query(Resume).filter(
        Resume.id == request.resume_id,
        Resume.user_id == user.id
    ).first()

    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

    analysis_result = rag_service.generate_ats_score(resume.raw_text, request.job_description)

    db_analysis = Analysis(
        user_id=user.id,
        resume_id=resume.id,
        job_description=request.job_description,
        ats_score=analysis_result.get("ats_score"),
        missing_skills=json.dumps(analysis_result.get("missing_skills", [])),
        matching_skills=json.dumps(analysis_result.get("matching_skills", [])),  # ← was missing
        suggestions=json.dumps(analysis_result.get("suggestions", []))
    )

    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)

    return db_analysis

@router.get("/analysis/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(
    analysis_id: int,
    token: str = Query(None),
    db: Session = Depends(get_db)
):
    """Get analysis details"""
    
    user = get_current_user(token, db)
    
    analysis = db.query(Analysis).filter(
        Analysis.id == analysis_id,
        Analysis.user_id == user.id
    ).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    return analysis


@router.post("/generate-questions/{analysis_id}")
def generate_interview_questions(
    analysis_id: int,
    question_type: str = "hr",
    token: str = Query(None),
    db: Session = Depends(get_db)
):
    """Generate interview questions for an analysis"""
    
    user = get_current_user(token, db)
    
    analysis = db.query(Analysis).filter(
        Analysis.id == analysis_id,
        Analysis.user_id == user.id
    ).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    # Get resume
    resume = db.query(Resume).filter(Resume.id == analysis.resume_id).first()
    
    # Generate questions
    questions_data = rag_service.generate_interview_questions(
        resume.raw_text,
        analysis.job_description,
        question_type
    )
    
    # Save to database
    saved_questions = []
    for q_data in questions_data:
        db_question = InterviewQuestion(
            analysis_id=analysis.id,
            question_type=question_type,
            question_text=q_data.get("question", ""),
            model_answer=q_data.get("model_answer", ""),
            category="generated"
        )
        db.add(db_question)
        saved_questions.append(db_question)
    
    db.commit()
    
    return [
        InterviewQuestionResponse(
            id=q.id,
            question_type=q.question_type,
            question_text=q.question_text,
            model_answer=q.model_answer,
            category=q.category
        )
        for q in saved_questions
    ]


@router.get("/questions/{analysis_id}", response_model=list[InterviewQuestionResponse])
def get_interview_questions(
    analysis_id: int,
    token: str = Query(None),
    db: Session = Depends(get_db)
):
    """Get interview questions for an analysis"""
    
    user = get_current_user(token, db)
    
    analysis = db.query(Analysis).filter(
        Analysis.id == analysis_id,
        Analysis.user_id == user.id
    ).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    questions = db.query(InterviewQuestion).filter(
        InterviewQuestion.analysis_id == analysis_id
    ).all()
    
    return questions
