from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
from typing import List, Dict, Any
import asyncio
import json
from sse_starlette.sse import EventSourceResponse

from database import get_db
from services.bot_service import BotService
from schemas import Message, ChatResponse, MessageRole, Asset, BotRequest, Mission
# from agents.simple_agent import graph, State
from agents.primary_agent import graph, State
import uuid
import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
router = APIRouter(prefix="/api/bot", tags=["bot"])


@router.post("/stream")
async def bot_stream(request: Request, bot_request: BotRequest):
    """Endpoint that streams responses from the graph"""
    
    async def event_generator():
        """Generate SSE events from graph outputs"""
        try:
            # Convert history to Message objects
            messages = [
                Message(
                    id=str(uuid.uuid4()),
                    role=MessageRole.USER if msg.role == "user" else MessageRole.ASSISTANT,
                    content=msg.content,
                    timestamp=msg.timestamp.isoformat()
                )
                for msg in bot_request.history
            ]
            
            # Add the current message
            current_message = Message(
                id=str(uuid.uuid4()),
                role=MessageRole.USER,
                content=bot_request.message,
                timestamp=datetime.now().isoformat()
            )
            messages.append(current_message)
            
            # Stream responses from the graph
            async for chunk in graph.astream({"messages": messages}, stream_mode="custom"):
                yield {
                    "event": "message",
                    "data": json.dumps(chunk)
                }
                
        except Exception as e:
            # Handle errors
            yield {
                "event": "error",
                "data": json.dumps({"status": "error", "message": str(e)})
            }
    
    return EventSourceResponse(event_generator())


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