from typing import Annotated, Dict, Any, AsyncIterator, List, Optional, Iterator, TypedDict, Callable, Union
from pydantic import BaseModel, Field
import json
from datetime import datetime
from serpapi import GoogleSearch
import uuid

from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage
from langchain_openai import ChatOpenAI
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_community.document_loaders import WebBaseLoader

from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import StreamWriter, Send, Command


from schemas.bot import Message, ChatResponse, MessageRole, Mission, Tool, Asset, MissionProposal
import os

from agents.prompts.mission_definition import MissionDefinitionPrompt, MissionProposal
from agents.prompts.supervisor_prompt import SupervisorPrompt, SupervisorResponse
from agents.prompts.steps_generator import StepsGeneratorPrompt, StepsGenerator

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")


class State(TypedDict):
    """State for the RAVE workflow"""
    messages: List[Message]
    mission: Mission
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

async def steps_generator_node(state: State, writer: StreamWriter, config: Dict[str, Any]) -> AsyncIterator[Dict[str, Any]]:
    """Generate a mission proposal based on user input"""
    if writer:
        writer({"status": "steps_generator_in_progress"})

    llm = getModel("steps_generator", config, writer)
    
    # Get the last user message
    last_message = state["messages"][-1]
    tools_str = "\n".join([f"- {tool.name}: {tool.description}" for tool in state["selectedTools"]])

    if not last_message:
        raise ValueError("No user message found in state")
    print(f"Last message: {last_message}")

    if writer:
        writer({
            "status": "steps_generator_request: " + last_message.content
        })

    try:
        # Create and format the prompt
        prompt = StepsGeneratorPrompt()
        formatted_prompt = prompt.get_formatted_prompt(
            user_input=last_message.content,
            available_tools=tools_str
        )

        print("Generating response...")
        # Generate and parse the response
        response = await llm.ainvoke(formatted_prompt)

        print("Parsing response...")

        steps_generator = prompt.parse_response(response.content)

        steps_generator_str = f"**Steps:** {steps_generator.steps}\n**Inputs needed:**\n" + "\n".join(f"- {input}" for input in steps_generator.inputs) + "\n\n**Expected outputs:**\n" + "\n".join(f"- {output}" for output in steps_generator.outputs) + "\n\n**Success criteria:**\n" + "\n".join(f"- {criteria}" for criteria in steps_generator.success_criteria)

        # Create a response message
        response_message = Message(
            id=str(uuid.uuid4()),
            role=MessageRole.ASSISTANT,
            content=steps_generator_str,
            timestamp=datetime.now().isoformat()
        )

        if writer:
            writer({
                "status": "steps_generator_completed",
                "steps_generator": steps_generator.dict()
            })

        return {
            "messages": [response_message],
            "steps_generator": steps_generator.dict()
        }

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
graph_builder.add_node("steps_generator", steps_generator_node)

# Add edges
graph_builder.add_edge(START, "steps_generator")


# Compile the graph with streaming support
compiled = graph_builder.compile()
graph = compiled 