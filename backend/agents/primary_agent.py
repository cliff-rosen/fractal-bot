from typing import Annotated, Dict, Any, AsyncIterator, List, Optional, Iterator, TypedDict, Callable, Union
from pydantic import BaseModel, Field
import logging
import json
from datetime import datetime
import time
import random
import operator
from serpapi import GoogleSearch
import uuid
import asyncio
import requests

from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage
from langchain_openai import ChatOpenAI
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_community.document_loaders import WebBaseLoader

from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import StreamWriter, Send

from schemas.bot import Message, ChatResponse, MessageRole, Mission, Tool, Asset
import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

SYSTEM_MESSAGE = """
You are a helpful assistant named Jack that can answer question.
"""


class State(TypedDict):
    """State for the RAVE workflow"""
    messages: List[Message]
    mission: Mission
    selectedTools: List[Tool]
    assets: List[Asset]

def validate_state(state: State) -> bool:
    """Validate the state before processing"""
    return True

def getModel(node_name: str, config: Dict[str, Any], writer: Optional[Callable] = None) -> ChatOpenAI:
    """Get the appropriate model for a given node."""
    model_name = "gpt-4o-mini"  
    
    chat_config = {
        "model": model_name,
        "api_key": OPENAI_API_KEY
    }
    
    return ChatOpenAI(**chat_config)

async def llm_call(state: State, writer: StreamWriter, config: Dict[str, Any]) -> AsyncIterator[Dict[str, Any]]:
    """Process messages through the LLM and stream the response"""
    if writer:
        writer({"status": "in_progress"})

    llm = getModel("llm", config, writer)
    
    # Convert messages to LangChain format
    langchain_messages = [SystemMessage(content=SYSTEM_MESSAGE)]
    for msg in state["messages"]:
        if msg.role == MessageRole.USER:
            langchain_messages.append(HumanMessage(content=msg.content))
        elif msg.role == MessageRole.ASSISTANT:
            langchain_messages.append(AIMessage(content=msg.content))
        elif msg.role == MessageRole.SYSTEM:
            langchain_messages.append(SystemMessage(content=msg.content))

    # Stream the response
    response_content = ""
    async for chunk in llm.astream(langchain_messages):
        if writer:
            writer({
                "token": chunk.content,
                "metadata": {
                    "type": "token",
                    "timestamp": datetime.now().isoformat()
                }
            })
        response_content += chunk.content

    try:
        # Try to parse the response as JSON
        response_json = json.loads(response_content)
    except json.JSONDecodeError:
        # If not JSON, assume it's a regular response
        pass

    # Create the response message
    response_message = Message(
        id=str(uuid.uuid4()),
        role=MessageRole.ASSISTANT,
        content=response_content,
        timestamp=datetime.now().isoformat()
    )

    if writer:
        writer({"status": "completed"})

    return {
        "messages": [response_message]
    }

### Graph

# Define the graph
graph_builder = StateGraph(State)

# Add nodes
graph_builder.add_node("llm_call", llm_call)

# Add edges
graph_builder.add_edge(START, "llm_call")


# Compile the graph with streaming support
compiled = graph_builder.compile()
graph = compiled 