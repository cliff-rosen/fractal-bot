from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services.bot_service import BotService
from schemas import Message, ChatResponse, MessageRole, Asset
from datetime import datetime
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter(prefix="/api/bot", tags=["bot"])

class MessageHistory(BaseModel):
    role: str
    content: str
    timestamp: datetime

class BotRequest(BaseModel):
    message: str
    history: List[MessageHistory] = []
    assets: List[Asset] = []

@router.post("/run", response_model=ChatResponse)
async def run_bot(
    request: BotRequest,
    db: Session = Depends(get_db)
):
    """Process a message and return the bot's response"""
    try:
        # Initialize bot service
        bot_service = BotService(db)
        
        # Convert history to dict format
        history = [
            {
                "role": msg.role,
                "content": msg.content,
                "timestamp": msg.timestamp
            }
            for msg in request.history
        ]
        
        # Process message and get response
        response = await bot_service.process_message(request.message, history, request.assets)
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 