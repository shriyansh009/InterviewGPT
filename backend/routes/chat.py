from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_db
from schemas import ChatMessage, ChatHistoryResponse
from models import User, ChatHistory
from utils.auth import decode_token
from services.embedding_service import EmbeddingService
from services.rag_service import RAGService

router = APIRouter(prefix="/chat", tags=["chat"])

# Initialize services
embedding_service = EmbeddingService()
rag_service = RAGService(embedding_service)

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
    db: Session = Depends(get_db)
):
    """Send chat message and get AI response"""
    
    user = get_current_user(token, db)

    # Save user message
    user_msg = ChatHistory(
        user_id=user.id,
        role="user",
        message=message.message
    )
    db.add(user_msg)
    db.commit()

    response_text = rag_service.generate_contextual_answer(
        message.message,
        [message.message]
    )

    assistant_msg = ChatHistory(
        user_id=user.id,
        role="assistant",
        message=response_text
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
    db: Session = Depends(get_db)
):
    """Get chat history for the current user"""
    
    user = get_current_user(token, db)
    
    history = db.query(ChatHistory).filter(
        ChatHistory.user_id == user.id
    ).order_by(ChatHistory.created_at).all()
    
    return history
