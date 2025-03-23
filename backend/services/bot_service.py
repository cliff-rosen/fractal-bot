from typing import List, Dict, Any, Optional, Union
from datetime import datetime
import uuid
import logging
from sqlalchemy.orm import Session
from database import SessionLocal
from services.ai_service import AIService
from services.search_service import google_search
from schemas import (
    Message, 
    ChatResponse, 
    MessageRole, 
    Asset, 
    Agent, 
    AssetStatus, 
    AgentStatus,
    AssetType
)
import json

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define available tools
TOOLS = [
    {
        "name": "search",
        "description": "Search the web using Google to find relevant information",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The search query to execute"
                },
                "num_results": {
                    "type": "integer",
                    "description": "Number of results to return (default: 5)",
                    "default": 5
                }
            },
            "required": ["query"]
        }
    },
    {
        "name": "retrieve",
        "description": "Retrieve specific information from a URL or content",
        "parameters": {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string",
                    "description": "The URL to retrieve content from"
                },
                "query": {
                    "type": "string",
                    "description": "Specific information to extract from the content"
                },
                "max_length": {
                    "type": "integer",
                    "description": "Maximum length of content to retrieve (default: 1000)",
                    "default": 1000
                }
            },
            "required": ["url", "query"]
        }
    }
]

class BotService:
    def __init__(self, db: Session):
        self.db = db
        self.ai_service = AIService()
        self.workflow_state = {
            "current_step": 0,
            "total_steps": 0,
            "status": "idle",
            "active_agents": [],
            "pending_approvals": []
        }

    async def process_message(self, message: str, history: List[Dict[str, Any]]) -> ChatResponse:
        """Process a user message and return a response with appropriate side effects"""
        try:
            # Initialize conversation history
            messages = [
                {
                    "role": msg["role"],
                    "content": msg["content"]
                }
                for msg in history
            ]
            
            # Add the current message
            messages.append({
                "role": "user",
                "content": message
            })
            
            # Log the input message
            logger.info(f"Processing message: {message}")
            
            # Maximum number of tool use iterations
            max_iterations = 5
            iteration = 0
            
            # Track tool use history
            tool_use_history = []
            
            while iteration < max_iterations:
                # Get response from AI service
                logger.info(f'Iteration {iteration + 1}: Requesting AI response')
                response = await self.ai_service.send_messages(
                    messages=messages,
                    system=self._get_system_prompt()
                )
                
                try:
                    # Clean the response to ensure it's valid JSON
                    response = response.strip()
                    if response.startswith('```json'):
                        response = response[7:]
                    if response.endswith('```'):
                        response = response[:-3]
                    response = response.strip()
                    
                    # Handle multiple JSON objects in response
                    if '\n\n' in response:
                        logger.info(f'Iteration {iteration + 1}: Received multiple tool requests')
                        # Take only the first tool request
                        response = response.split('\n\n')[0]
                    
                    # Parse the JSON response
                    response_data = json.loads(response)
                    
                    if not isinstance(response_data, dict):
                        raise ValueError("Response must be a JSON object")
                        
                    if "type" not in response_data:
                        raise ValueError("Response must include a 'type' field")
                    
                    if response_data.get("type") == "tool":   
                        # Execute the tool
                        tool_name = response_data["tool"]["name"]
                        tool_params = response_data["tool"].get("parameters", {})
                        logger.info(f'Iteration {iteration + 1}: Executing {tool_name} with params: {tool_params}')
                        
                        tool_results = await self._execute_tool(response_data["tool"])
                        
                        # Log tool results summary
                        if tool_name == "search":
                            num_results = len(tool_results.get("results", []))
                            logger.info(f'Iteration {iteration + 1}: {tool_name} completed - found {num_results} results')
                        elif tool_name == "retrieve":
                            num_chunks = len(tool_results.get("content", []))
                            logger.info(f'Iteration {iteration + 1}: {tool_name} completed - extracted {num_chunks} relevant chunks')
                        else:
                            logger.info(f'Iteration {iteration + 1}: {tool_name} completed successfully')
                        
                        # Track tool use in history
                        tool_use_history.append({
                            "iteration": iteration + 1,
                            "tool": response_data["tool"],
                            "results": tool_results
                        })
                        
                        # Add tool request and results to conversation history
                        messages.append({
                            "role": "assistant",
                            "content": json.dumps({
                                "type": "tool",
                                "tool": response_data["tool"]
                            })
                        })
                        messages.append({
                            "role": "assistant",
                            "content": json.dumps({
                                "type": "tool_result",
                                "tool": response_data["tool"]["name"],
                                "results": tool_results
                            })
                        })
                        
                        # Continue the loop with updated history
                        iteration += 1
                        continue
                        
                    elif response_data.get("type") == "final_response":
                        # Process final response
                        logger.info(f'Iteration {iteration + 1}: Received final response')
                        side_effects = {
                            "final_response": response_data["response"],
                            "assets": response_data.get("assets", []),
                            "agents": response_data.get("agents", []),
                            "tool_use_history": tool_use_history
                        }
                        
                        # Create chat response
                        return ChatResponse(
                            message=Message(
                                message_id=str(uuid.uuid4()),
                                role=MessageRole.ASSISTANT,
                                content=response_data["response"],
                                timestamp=datetime.now(),
                                metadata=self._get_message_metadata(side_effects)
                            ),
                            sideEffects=side_effects
                        )
                    else:
                        raise ValueError(f"Invalid response type: {response_data.get('type')}")
                        
                except json.JSONDecodeError as e:
                    logger.error(f"Iteration {iteration + 1}: JSON parsing error: {str(e)}")
                    logger.error(f"Raw response: {response}")
                    raise ValueError(f"AI response must be valid JSON: {str(e)}")
                except Exception as e:
                    logger.error(f"Iteration {iteration + 1}: Error processing response: {str(e)}")
                    logger.error(f"Raw response: {response}")
                    raise ValueError(f"Error processing AI response: {str(e)}")
            
            # If we've exceeded max iterations, return the last response with tool history
            logger.warning(f"Maximum iterations ({max_iterations}) reached")
            return ChatResponse(
                message=Message(
                    message_id=str(uuid.uuid4()),
                    role=MessageRole.ASSISTANT,
                    content="I've reached the maximum number of tool use iterations. Please try rephrasing your request.",
                    timestamp=datetime.now(),
                    metadata={
                        "error": True, 
                        "max_iterations_reached": True,
                        "tool_use_history": tool_use_history
                    }
                ),
                sideEffects={"tool_use_history": tool_use_history}
            )
            
        except Exception as e:
            # Handle errors and create appropriate error response
            error_message = f"Error processing message: {str(e)}"
            logger.error(f"Error in process_message: {error_message}")
            return ChatResponse(
                message=Message(
                    message_id=str(uuid.uuid4()),
                    role=MessageRole.ASSISTANT,
                    content=error_message,
                    timestamp=datetime.now(),
                    metadata={"error": True}
                ),
                sideEffects={}
            )

    async def _process_ai_response(self, response: str) -> Dict[str, Any]:
        """Process the AI response and determine necessary side effects"""
        try:
            # Parse the JSON response
            response_data = json.loads(response)
            
            # Handle different response types
            if response_data.get("type") == "tool":
                # Execute the tool and get results
                tool_results = await self._execute_tool(response_data["tool"])
                return {
                    "tool_executed": response_data["tool"],
                    "tool_results": tool_results
                }
            elif response_data.get("type") == "final_response":
                # Handle final response with any asset/agent details
                return {
                    "final_response": response_data["response"],
                    "assets": response_data.get("assets", []),
                    "agents": response_data.get("agents", [])
                }
            else:
                raise ValueError(f"Invalid response type: {response_data.get('type')}")
                
        except json.JSONDecodeError:
            raise ValueError("AI response must be valid JSON")
        except Exception as e:
            raise ValueError(f"Error processing AI response: {str(e)}")

    async def _execute_tool(self, tool_call: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a tool and return its results"""
        tool_name = tool_call.get("name")
        tool_params = tool_call.get("parameters", {})
        
        if tool_name == "search":
            logger.info(f"Executing search with query: {tool_params.get('query')}")
            try:
                # Get search results using the actual search service
                results = await google_search(
                    query=tool_params.get('query'),
                    num_results=tool_params.get('num_results', 5)
                )
                
                # Transform results to match expected format
                formatted_results = [
                    {
                        "title": result["title"],
                        "url": result["link"],
                        "snippet": result["snippet"],
                        "displayLink": result["displayLink"],
                        "pagemap": result.get("pagemap", {})
                    }
                    for result in results
                ]
                
                logger.info(f"Search returned {len(formatted_results)} results")
                return {
                    "results": formatted_results
                }
                
            except Exception as e:
                logger.error(f"Error executing search: {str(e)}")
                return {
                    "results": [],
                    "error": str(e)
                }
        elif tool_name == "retrieve":
            logger.info(f"Executing retrieve for URL: {tool_params.get('url')}")
            try:
                import requests
                from bs4 import BeautifulSoup
                import re

                # Fetch the content
                response = requests.get(tool_params.get('url'))
                response.raise_for_status()
                
                # Parse the content
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Remove script and style elements
                for script in soup(["script", "style"]):
                    script.decompose()
                
                # Get text content
                text = soup.get_text()
                
                # Clean up whitespace
                lines = (line.strip() for line in text.splitlines())
                chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                text = ' '.join(chunk for chunk in chunks if chunk)
                
                # Truncate to max length if specified
                max_length = tool_params.get('max_length', 1000)
                if len(text) > max_length:
                    text = text[:max_length] + "..."
                
                # Extract relevant content based on query
                query = tool_params.get('query', '').lower()
                relevant_chunks = []
                
                # Split into paragraphs
                paragraphs = text.split('\n\n')
                for para in paragraphs:
                    if query in para.lower():
                        relevant_chunks.append(para.strip())
                
                return {
                    "url": tool_params.get('url'),
                    "query": query,
                    "content": relevant_chunks if relevant_chunks else [text[:max_length] + "..."],
                    "total_length": len(text)
                }
                
            except Exception as e:
                logger.error(f"Error executing retrieve: {str(e)}")
                return {
                    "error": str(e),
                    "url": tool_params.get('url'),
                    "query": tool_params.get('query')
                }
        else:
            raise ValueError(f"Unknown tool: {tool_name}")

    def _get_message_metadata(self, side_effects: Dict[str, Any]) -> Dict[str, Any]:
        """Generate appropriate metadata for the message based on side effects"""
        metadata = {}
        
        if side_effects.get("tool_executed"):
            metadata["tool_executed"] = side_effects["tool_executed"]
            metadata["tool_results"] = side_effects["tool_results"]
        
        if side_effects.get("final_response"):
            metadata["final_response"] = side_effects["final_response"]
            if side_effects.get("assets"):
                metadata["asset_references"] = [asset["id"] for asset in side_effects["assets"]]
            if side_effects.get("agents"):
                metadata["agent_references"] = [agent["id"] for agent in side_effects["agents"]]
            
        # Add tool use history to metadata if it exists
        if side_effects.get("tool_use_history"):
            metadata["tool_use_history"] = side_effects["tool_use_history"]
            
        return metadata

    def _get_system_prompt(self) -> str:
        """Get the system prompt for the AI service"""
        return f"""You are FractalBot, an intelligent assistant that helps users accomplish tasks through a combination of conversation and automated workflows.

CRITICAL: You must ALWAYS respond with a valid JSON object. Your entire response must be a single JSON object, not a mix of text and JSON.
DO NOT wrap your response in markdown code blocks (```json) or any other formatting.
DO NOT include any text before or after the JSON object.

You have two possible response formats:

1. To use a tool:
{{
    "type": "tool",
    "tool": {{
        "name": "search",
        "parameters": {{
            "query": "your search query here",
            "num_results": 5
        }}
    }}
}}

2. To give a final response:
{{
    "type": "final_response",
    "response": "Your response text here",
    "assets": [],
    "agents": []
}}

Available Tools:
{json.dumps(TOOLS, indent=2)}

Examples:

1. If you need to search for information:
{{
    "type": "tool",
    "tool": {{
        "name": "search",
        "parameters": {{
            "query": "latest developments in AI",
            "num_results": 3
        }}
    }}
}}

2. If you have enough information to answer:
{{
    "type": "final_response",
    "response": "Based on the search results, here's what I found...",
    "assets": [],
    "agents": []
}}

Guidelines:
1. Your entire response must be a single valid JSON object
2. Do not include any text outside the JSON object
3. Do not wrap the response in markdown code blocks
4. Use tools when you need to gather information
5. Provide final responses when you have enough information
6. Be concise and clear in your communication
7. Maintain conversation context

Remember:
- Always wrap your entire response in curly braces {{}}
- Use double quotes for all strings
- Do not include any text before or after the JSON object
- Do not use markdown formatting
- Handle errors gracefully
- Maintain a professional and helpful tone""" 