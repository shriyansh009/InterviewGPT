from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from schemas import ChatMessage, ChatHistoryResponse
from models import User, ChatHistory, Resume, Analysis
from utils.auth import decode_token
from services.embedding_service import EmbeddingService
from services.rag_service import RAGService

router = APIRouter(prefix="/chat", tags=["chat"])

# Initialize services
embedding_service = EmbeddingService()
rag_service = RAGService(embedding_service)

# System-level formatting instructions for the LLM
RESPONSE_STYLE_PROMPT = """
When answering, follow these rules:
- Keep answers short, conversational, and easy to scan.
- Use clear headers of 2-3 words when you need sections.
- Use short bullet points rather than long paragraphs.
- Avoid excessive bolding; only highlight truly important terms.
- If the question is about the user's resume, base your response on the resume and job description.
- If the resume or analysis context is available, mention relevant achievements, skills, or experience.
- If the user asks a normal question, answer directly and simply.
- If you cannot answer from the provided resume context, say so honestly and offer a general suggestion.
- Include a short code example only when it adds value.
- Finish with a brief friendly closing line, not a formal summary.
"""


def normalize_text(text: str) -> str:
    return text.strip().lower()


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


@router.post("/message")
def send_message(
    message: ChatMessage,
    token: str = Query(None),
    analysis_id: int = Query(None),
    db: Session = Depends(get_db)
):
    """Send chat message and get AI response"""
    
    user = get_current_user(token, db)
    context_texts = [message.message]
    resolved_analysis_id = analysis_id or message.analysis_id

    if resolved_analysis_id:
        analysis = db.query(Analysis).filter(
            Analysis.id == resolved_analysis_id,
            Analysis.user_id == user.id
        ).first()

        if analysis:
            resume = db.query(Resume).filter(Resume.id == analysis.resume_id).first()
            if resume:
                # Prefer resume + job description as context for RAG.
                context_texts = [resume.raw_text, analysis.job_description]

    # Save user message
    user_msg = ChatHistory(
        user_id=user.id,
        role="user",
        message=message.message,
        analysis_id=resolved_analysis_id
    )
    db.add(user_msg)
    db.commit()

    response_text = rag_service.generate_contextual_answer(
        message.message,
        context_texts,
        system_prompt=RESPONSE_STYLE_PROMPT
    )

    assistant_msg = ChatHistory(
        user_id=user.id,
        role="assistant",
        message=response_text,
        analysis_id=resolved_analysis_id
    )
    db.add(assistant_msg)
    db.commit()

    return {
        "user_message": user_msg.message,
        "assistant_message": response_text
    }


@router.get("/history", response_model=list[ChatHistoryResponse])
def get_chat_history(
    token: str = None,
    analysis_id: int = Query(None),
    db: Session = Depends(get_db)
):
    """Get chat history for the current user"""
    
    user = get_current_user(token, db)
    
    query = db.query(ChatHistory).filter(ChatHistory.user_id == user.id)
    if analysis_id:
        query = query.filter(ChatHistory.analysis_id == analysis_id)
    history = query.order_by(ChatHistory.created_at).all()
    
    return history