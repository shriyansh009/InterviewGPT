import json
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from schemas import ChatMessage, ChatHistoryResponse
from models import User, ChatHistory, Analysis
from utils.auth import decode_token
from services.embedding_service import EmbeddingService
from services.rag_service import RAGService

router = APIRouter(prefix="/chat", tags=["chat"])

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


@router.post("/message")
def send_message(
    message: ChatMessage,
    analysis_id: int = None,
    token: str = Query(None),
    db: Session = Depends(get_db)
):
    """Send chat message and get AI response"""
    
    user = get_current_user(token, db)
    
    # Verify analysis if provided
    if analysis_id:
        analysis = db.query(Analysis).filter(
            Analysis.id == analysis_id,
            Analysis.user_id == user.id
        ).first()
        
        if not analysis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found"
            )
    
    # Save user message
    user_msg = ChatHistory(
        user_id=user.id,
        analysis_id=analysis_id,
        role="user",
        message=message.message
    )
    db.add(user_msg)
    db.commit()
    
    # Get context from embeddings if analysis exists
    context_texts = []
    if analysis_id:
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        context_texts = [analysis.job_description]
    
    # Generate response using RAG
    response_text = rag_service.generate_contextual_answer(
        message.message,
        context_texts if context_texts else [message.message]
    )
    
    # Save assistant message
    assistant_msg = ChatHistory(
        user_id=user.id,
        analysis_id=analysis_id,
        role="assistant",
        message=response_text
    )
    db.add(assistant_msg)
    db.commit()
    
    return {
        "user_message": user_msg.message,
        "assistant_message": response_text
    }


@router.get("/history/{analysis_id}", response_model=list[ChatHistoryResponse])
def get_chat_history(
    analysis_id: int,
    token: str = None,
    db: Session = Depends(get_db)
):
    """Get chat history for an analysis"""
    
    user = get_current_user(token, db)
    
    # Verify analysis belongs to user
    analysis = db.query(Analysis).filter(
        Analysis.id == analysis_id,
        Analysis.user_id == user.id
    ).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    history = db.query(ChatHistory).filter(
        ChatHistory.analysis_id == analysis_id
    ).order_by(ChatHistory.created_at).all()
    
    return history
