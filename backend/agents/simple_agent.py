from typing import Annotated, Dict, Any, AsyncIterator, List, Optional, Iterator, TypedDict, Callable
from pydantic import BaseModel, Field
import logging
import json
from datetime import datetime
import time
import random
import operator
from serpapi import GoogleSearch

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


from ..config.settings import (
    DEFAULT_MODEL,
    MAX_ITERATIONS,  
    SCORE_THRESHOLD,
    IMPROVEMENT_THRESHOLD,
    MAX_SEARCH_RESULTS,
    LOG_LEVEL,
    LOG_FORMAT,
    TAVILY_API_KEY,
    OPENAI_API_KEY,
    SERPAPI_API_KEY
)

from .utils.prompts import (
    create_question_improvement_prompt
)

class State(TypedDict):
    """State for the RAVE workflow"""
    messages: Annotated[list, add_messages]

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
    model_name = DEFAULT_MODEL
    
    
    # Create base model configuration
    chat_config = {
        "model": model_name,
        "api_key": OPENAI_API_KEY
    }
    
    return ChatOpenAI(**chat_config)

### Nodes
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
graph_builder.add_node("improve_question", improve_question)

# Add edges
graph_builder.add_edge(START, "improve_question")

# Compile the graph
compiled = graph_builder.compile()
graph = compiled 