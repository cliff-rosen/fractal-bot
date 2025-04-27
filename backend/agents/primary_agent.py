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
from langgraph.graph.message import Command

from schemas.bot import Message, ChatResponse, MessageRole, Mission, Tool, Asset, MissionProposal
import os

from agents.prompts.mission_definition import MissionDefinitionPrompt, MissionProposal
from agents.prompts.supervisor_prompt import SupervisorPrompt, SupervisorResponse

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

SYSTEM_MESSAGE = """
You are a helpful assistant named Jack that can answer question.
"""


class State(TypedDict):
    """State for the RAVE workflow"""
    messages: List[Message]
    mission: Mission
    mission_proposal: MissionProposal
    selectedTools: List[Tool]
    assets: List[Asset]
    supervisor_response: SupervisorResponse
    next_node: str

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

async def mission_proposal_node(state: State, writer: StreamWriter, config: Dict[str, Any]) -> AsyncIterator[Dict[str, Any]]:
    """Generate a mission proposal based on user input"""
    if writer:
        writer({"status": "mission_proposal_in_progress"})

    llm = getModel("mission_proposal", config, writer)
    
    # Get the last user message
    last_message = state["messages"][-1]
    if not last_message:
        raise ValueError("No user message found in state")
    print(f"Last message: {last_message}")

    if writer:
        writer({
            "status": "mission_proposal_request: " + last_message.content
        })

    # Create and format the prompt
    prompt = MissionDefinitionPrompt()
    prompt_template = prompt.get_prompt_template()
    
    # Format tools as a readable string
    tools_str = "\n".join([f"- {tool.name}: {tool.description}" for tool in state["selectedTools"]])
    
    formatted_prompt = prompt_template.format_messages(
        user_input=last_message.content,
        available_tools=tools_str,
        format_instructions=prompt.format_instructions
    )

    # Get the parser
    parser = PydanticOutputParser(pydantic_object=MissionProposal)

    try:
        print("Generating response...")
        # Generate the response
        response = await llm.ainvoke(formatted_prompt)
        print(f"Response: {response}")

        print("Parsing response...")
        # Parse the response
        mission_proposal = parser.parse(response.content)
        print(f"Parsed mission proposal: {mission_proposal}")
        
        # Create a response message
        response_message = Message(
            id=str(uuid.uuid4()),
            role=MessageRole.ASSISTANT,
            content=f"I've created a mission proposal for you:\n\nTitle: {mission_proposal.title}\nGoal: {mission_proposal.goal}\n\nInputs needed:\n" + 
                   "\n".join(f"- {input}" for input in mission_proposal.inputs) +
                   "\n\nExpected outputs:\n" + "\n".join(f"- {output}" for output in mission_proposal.outputs) +
                   "\n\nSuccess criteria:\n" + "\n".join(f"- {criteria}" for criteria in mission_proposal.success_criteria),
            timestamp=datetime.now().isoformat()
        )

        if writer:
            writer({
                "status": "mission_proposal_completed",
                "mission_proposal": mission_proposal.dict()
            })

        return {
            "messages": [response_message],
            "mission_proposal": mission_proposal.dict()
        }

    except Exception as e:
        if writer:
            writer({
                "status": "error",
                "error": str(e)
            })
        raise

async def supervisor_node(state: State, writer: StreamWriter, config: Dict[str, Any]) -> AsyncIterator[Dict[str, Any]]:
    """Supervisor node that either answers directly or routes to specialists"""
    if writer:
        writer({"status": "supervisor_starting"})

    llm = getModel("supervisor", config, writer)
    
    # Get the last user message
    last_message = next((msg for msg in reversed(state["messages"]) if msg.role == MessageRole.USER), None)
    if not last_message:
        raise ValueError("No user message found in state")

    # Create and format the prompt
    prompt = SupervisorPrompt()
    prompt_template = prompt.get_prompt_template()
    
    formatted_prompt = prompt_template.format_messages(
        user_input=last_message.content,
        format_instructions=prompt.format_instructions
    )

    # Get the parser
    parser = PydanticOutputParser(pydantic_object=SupervisorResponse)

    try:
        # Generate the response
        response = await llm.ainvoke(formatted_prompt)
        
        # Parse the response
        supervisor_response = parser.parse(response.content)
        
        # Create a response message
        response_message = Message(
            id=str(uuid.uuid4()),
            role=MessageRole.ASSISTANT,
            content=supervisor_response.response_content,
            timestamp=datetime.now().isoformat()
        )

        # Based on response type, determine next node
        next_node = None
        if supervisor_response.response_type == "MISSION_SPECIALIST":
            next_node = "mission_proposal_node"
        elif supervisor_response.response_type == "WORKFLOW_SPECIALIST":
            next_node = "workflow_node"  # You'll need to implement this node
        else:
            next_node = END

        # if final answer send token
        if supervisor_response.response_type == "FINAL_ANSWER":
            writer({
                 "token": response_message.content
            })

        if writer:
            writer({
                "status": "supervisor_completed: " + supervisor_response.response_type,
                "supervisor_response": supervisor_response.dict(),
                "next_node": next_node
            })

        return Command(goto=next_node, mission_proposal=state["mission_proposal"])


    except Exception as e:
        if writer:
            writer({
                "status": "error",
                "error": str(e)
            })
        raise

### Graph

# Define the graph
graph_builder = StateGraph(State)

# Add nodes
graph_builder.add_node("supervisor_node", supervisor_node)
graph_builder.add_node("mission_proposal_node", mission_proposal_node)

# Add edges
graph_builder.add_edge(START, "supervisor_node")
graph_builder.add_edge("mission_proposal_node", "supervisor_node")


# Compile the graph with streaming support
compiled = graph_builder.compile()
graph = compiled 