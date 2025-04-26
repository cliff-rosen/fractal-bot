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

from schemas.bot import Message, ChatResponse, MessageRole
import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

# Tool Schemas
class WeatherToolInput(BaseModel):
    """Input schema for weather tool"""
    location: str = Field(description="The city and state, e.g. San Francisco, CA")

class ToolCall(BaseModel):
    """Represents a tool call request"""
    name: str = Field(description="The name of the tool to call")
    arguments: Dict[str, Any] = Field(description="The arguments to pass to the tool")

class ToolResult(BaseModel):
    """Represents a tool call result"""
    tool_call_id: str
    tool_name: str
    result: Dict[str, Any]

class State(TypedDict):
    """State for the RAVE workflow"""
    messages: List[Message]
    tool_calls: List[ToolCall]
    tool_results: List[ToolResult]

# System message describing available tools
TOOLS_SYSTEM_MESSAGE = """You are a helpful AI assistant with access to the following tools:

1. weather: Get current weather information for a location
   - Input: location (string) - The city and state, e.g. "San Francisco, CA"
   - Returns: Current weather conditions including temperature, conditions, and humidity

When you need to use a tool, respond with a JSON object containing a "tool_calls" array. Each tool call should have:
- name: The name of the tool
- arguments: A dictionary of arguments for the tool

Example:
{
    "tool_calls": [
        {
            "name": "weather",
            "arguments": {
                "location": "San Francisco, CA"
            }
        }
    ]
}

After receiving tool results, you can use them to answer the user's question."""

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

async def weather_tool(location: str) -> Dict[str, Any]:
    """Get weather information for a location"""
    try:
        # This is a mock implementation - replace with actual weather API call
        # For example, using OpenWeatherMap API:
        # url = f"https://api.openweathermap.org/data/2.5/weather?q={location}&appid={WEATHER_API_KEY}"
        # response = requests.get(url)
        # return response.json()
        
        # Mock response for now
        return {
            "location": location,
            "temperature": 72,
            "conditions": "sunny",
            "humidity": 45
        }
    except Exception as e:
        return {"error": str(e)}

async def tool_call(state: State, writer: StreamWriter, config: Dict[str, Any]) -> AsyncIterator[Dict[str, Any]]:
    """Process tool calls and return results"""
    if not state.get("tool_calls"):
        return {}
        
    tool_results = []
    for tool_call in state["tool_calls"]:
        try:
            if tool_call.name == "weather":
                # Validate input
                input_data = WeatherToolInput(**tool_call.arguments)
                result = await weather_tool(input_data.location)
                tool_results.append(ToolResult(
                    tool_call_id=str(uuid.uuid4()),
                    tool_name="weather",
                    result=result
                ))
        except Exception as e:
            tool_results.append(ToolResult(
                tool_call_id=str(uuid.uuid4()),
                tool_name=tool_call.name,
                result={"error": f"Tool call failed: {str(e)}"}
            ))
    
    return {"tool_results": tool_results}

def should_continue(state: State) -> bool:
    """Determine if we should continue processing based on tool calls"""
    return bool(state.get("tool_calls"))

async def llm_call(state: State, writer: StreamWriter, config: Dict[str, Any]) -> AsyncIterator[Dict[str, Any]]:
    """Process messages through the LLM and stream the response"""
    if writer:
        writer({"status": "in_progress"})

    llm = getModel("llm", config, writer)
    
    # Convert messages to LangChain format
    langchain_messages = [SystemMessage(content=TOOLS_SYSTEM_MESSAGE)]
    for msg in state["messages"]:
        if msg.role == MessageRole.USER:
            langchain_messages.append(HumanMessage(content=msg.content))
        elif msg.role == MessageRole.ASSISTANT:
            langchain_messages.append(AIMessage(content=msg.content))
        elif msg.role == MessageRole.SYSTEM:
            langchain_messages.append(SystemMessage(content=msg.content))

    # Add tool results to messages if they exist
    if state.get("tool_results"):
        for result in state["tool_results"]:
            langchain_messages.append(ToolMessage(
                content=json.dumps(result.result),
                tool_call_id=result.tool_call_id
            ))

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

    # Parse tool calls from response
    tool_calls = []
    try:
        # Try to parse the response as JSON
        response_json = json.loads(response_content)
        if isinstance(response_json, dict) and "tool_calls" in response_json:
            tool_calls = [ToolCall(**call) for call in response_json["tool_calls"]]
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
        "messages": [response_message],
        "tool_calls": tool_calls
    }

### Graph

# Define the graph
graph_builder = StateGraph(State)

# Add nodes
graph_builder.add_node("llm_call", llm_call)
graph_builder.add_node("tool_call", tool_call)

# Add edges
graph_builder.add_edge(START, "llm_call")

# Add conditional edges
graph_builder.add_conditional_edges(
    "llm_call",
    should_continue,
    {
        True: "tool_call",
        False: END
    }
)

graph_builder.add_edge("tool_call", "llm_call")

# Compile the graph with streaming support
compiled = graph_builder.compile()
graph = compiled 