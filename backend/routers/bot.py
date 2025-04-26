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
from schemas import Message, ChatResponse, MessageRole, Asset
from agents.simple_agent import graph, State
import uuid

router = APIRouter(prefix="/api/bot", tags=["bot"])

class MessageHistory(BaseModel):
    role: str
    content: str
    timestamp: datetime

class BotRequest(BaseModel):
    message: str
    history: List[MessageHistory] = []
    assets: List[Asset] = []

async def generate_stream():
    """A sample streaming node that simulates an LLM generating tokens"""

    message = "Starting the analysis process...".split(" ")
    for token in message:
        yield {"token": token, "metadata": {"type": "status"}}
        await asyncio.sleep(0.2)
    
    yield {
        "status": {
            "id": "update-1",
            "timestamp": datetime.now().isoformat(),
            "title": "Update from the agent",
            "details": "This is the first status update",
            "icon": "📊"
        }
    }
    await asyncio.sleep(1)
    
    message = "Now analyzing the collected data...".split(" ")
    for token in message:
        yield {"token": token, "metadata": {"type": "status"}}
        await asyncio.sleep(0.2)
    
    # Second status update
    yield {
        "status": {
            "id": "update-2",
            "timestamp": datetime.now().isoformat(),
            "title": "Update from the agent",
            "details": "This is the second status update",
            "icon": "🔍"
        }
    }
    await asyncio.sleep(1)
    
    message = "Analysis complete. Generating insights...".split(" ")
    for token in message:
        yield {"token": token, "metadata": {"type": "status"}}
        await asyncio.sleep(0.2)

    # Final status update
    yield {
        "status": {
            "id": "update-3",
            "timestamp": datetime.now().isoformat(),
            "title": "Update from the agent",
            "details": "This is the third status update",
            "icon": "💡"
        }
    }


@router.get("/stream")
async def bot_stream(request: Request):
    """Endpoint that streams responses from the graph"""
    
    async def event_generator():
        """Generate SSE events from graph outputs"""
        try:
            # Directly iterate over the async generator
            async for chunk in generate_stream():
                # Convert chunk to JSON and yield as SSE event
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

@router.get("/stream2")
async def bot_stream2(request: Request):
    """Endpoint that streams responses from the graph"""
    
    async def event_generator():
        """Generate SSE events from graph outputs"""
        try:
            # Create initial message
            id = str(uuid.uuid4())
            timestamp = datetime.now().isoformat()
            messages = [
                Message(id=id, role=MessageRole.USER, content="Hello, how are you?", timestamp=timestamp)
            ]
            
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



@router.get("/run_bot_1", response_model=ChatResponse)
async def run_bot_1():

    id = str(uuid.uuid4())
    timestamp = datetime.now().isoformat()
    messages = [
        Message(id=id, role=MessageRole.USER, content="Hello, how are you?", timestamp=timestamp)
    ]

    response = await graph.ainvoke({"messages": messages}, stream_mode="values")
    
    # Transform the response into a ChatResponse
    chat_response = ChatResponse(
        message=response["messages"][0],
        status="success",
        error=None
    )

    return chat_response


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