from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services.ai_service import AIService
from schemas import Message, ChatResponse, MessageRole
from datetime import datetime
import uuid
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api/bot", tags=["bot"])

# Initialize AI service
ai_service = AIService()

class MessageHistory(BaseModel):
    role: str
    content: str
    timestamp: datetime

class BotRequest(BaseModel):
    message: str
    history: List[MessageHistory] = []

@router.post("/run", response_model=ChatResponse)
async def run_bot(
    request: BotRequest,
    db: Session = Depends(get_db)
):
    """Process a message and return the bot's response"""
    try:
        # Convert history to the format expected by AI service
        messages = [
            {
                "role": msg.role,
                "content": msg.content
            }
            for msg in request.history
        ]
        
        # Add the current message
        messages.append({
            "role": "user",
            "content": request.message
        })
        
        # Get response from AI service
        response = await ai_service.send_messages(messages)
        
        # Create chat response
        chat_response = ChatResponse(
            message=Message(
                message_id=str(uuid.uuid4()),
                role=MessageRole.ASSISTANT,
                content=response,
                timestamp=datetime.now(),
                metadata={}
            ),
            sideEffects={}
        )
        
        return chat_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 