from typing import Annotated, Dict, Any, AsyncIterator, List, Optional, Iterator, TypedDict, Callable
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

from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_community.document_loaders import WebBaseLoader

from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import StreamWriter, Send

from schemas.bot import Message, ChatResponse, MessageRole
import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

from .utils.prompts import (
    create_question_improvement_prompt
)

class State(TypedDict):
    """State for the RAVE workflow"""
    messages: List[Message]

def validate_state(state: State) -> bool:
    """Validate the state before processing"""
    return True

def getModel(node_name: str, config: Dict[str, Any], writer: Optional[Callable] = None) -> ChatOpenAI:
    """Get the appropriate model for a given node.
    
    Args:
        node_name: The name of the node (e.g. 'question_model', 'answer_model')
        config: The configuration dictionary containing model settings
        writer: Optional callback for writing messages
        
    Returns:
        ChatOpenAI instance configured with the appropriate model
    """
    model_name = "gpt-4o-mini"
    
    
    # Create base model configuration
    chat_config = {
        "model": model_name,
        "api_key": OPENAI_API_KEY
    }
    
    return ChatOpenAI(**chat_config)

### Nodes
log_template = {
    "id": "update-1",
    "timestamp": datetime.now().isoformat(),
    "title": "Update from the agent",
    "details": "This is the first status update",
    "icon": "📊",
    "status": "in_progress"
}

async def mock_llm(state: State, writer: StreamWriter, config: Dict[str, Any]) -> AsyncIterator[Dict[str, Any]]:
    """Mock LLM that streams responses"""
    log_template["status"] = "in_progress"
    log_template["details"] = "The agent is working on the task"
    if writer:
        writer({"status": log_template})

    message_parts = ["Hello,", " how", " are", " you", "?"]
    for part in message_parts:
        await asyncio.sleep(0.3)  # Simulate processing time
        if writer:
            writer({
                "token": part, 
                "metadata": {
                    "type": "token",
                    "timestamp": datetime.now().isoformat()
                }
            })

    message = Message(
        id=str(uuid.uuid4()),
        role=MessageRole.ASSISTANT,
        content="hello",
        timestamp=datetime.now().isoformat()
    )

    log_template["status"] = "completed"
    log_template["details"] = "The agent has completed the task"
    if writer:
        writer({"status": log_template})


    return {"messages": [message]}

def improve_question(state: State, writer: StreamWriter, config: Dict[str, Any]) -> AsyncIterator[Dict[str, Any]]:
    """Improve the question for clarity and completeness"""
    writer({"msg": "Improving question for clarity and completeness..."})
    
    if not validate_state(state):
        writer({"msg": "Error: No question provided"})
        return {}
    
    llm = getModel("question_model", config, writer)
    improvement_prompt = create_question_improvement_prompt()
    
    try:
        formatted_prompt = improvement_prompt.format(question=state["question"])
        improved_question = llm.invoke(formatted_prompt)
        writer({"msg": "Question improved successfully"})
        
        return {"improved_question": improved_question.content}
        
    except Exception as e:
        writer({"msg": f"Error improving question: {str(e)}"})
        return {}


### Graph

# Define the graph
graph_builder = StateGraph(State)

# Add nodes
graph_builder.add_node("mock_llm", mock_llm)

# Add edges
graph_builder.add_edge(START, "mock_llm")
graph_builder.add_edge("mock_llm", END)

# Compile the graph with streaming support
compiled = graph_builder.compile()
graph = compiled 