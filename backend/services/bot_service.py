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
    AgentStatus
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

    def get_clean_response_json(self, response: str) -> str:
        """Clean the response to ensure it's valid JSON"""
        response = response.strip()
        if response.startswith('```json'):
            response = response[7:]
        if response.endswith('```'):    
            response = response[:-3]
                    # Handle multiple JSON objects in response
        if '\n\n' in response:
            logger.info(f'Received multiple tool requests')
            # Take only the first tool request
            response = response.split('\n\n')[0]

        return json.loads(response)


    async def process_message(self, message: str, history: List[Dict[str, Any]], assets: List[Asset] = None) -> ChatResponse:
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
                    system=self._get_system_prompt(assets)
                )
                print('response', response)

                try:
                    # Clean the response to ensure it's valid JSON
                    response_data = self.get_clean_response_json(response)
                    
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
                        
                        # Process agent jobs and direct assets
                        processed_response = await self._process_ai_response(response)
                        
                        # Create chat response with processed side effects
                        return ChatResponse(
                            message=Message(
                                message_id=str(uuid.uuid4()),
                                role=MessageRole.ASSISTANT,
                                content=response_data["response"],
                                timestamp=datetime.now(),
                                metadata=self._get_message_metadata(processed_response)
                            ),
                            sideEffects={
                                "final_response": response_data["response"],
                                "agent_jobs": processed_response.get("agent_jobs", []),  # Pass raw agent jobs
                                "assets": processed_response.get("assets", []),
                                "tool_use_history": tool_use_history
                            }
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
                # Handle final response with any agent job recommendations and direct assets
                agent_jobs = response_data.get("agent_jobs", [])
                direct_assets = response_data.get("assets", [])
                
                # Process agent jobs
                for job in agent_jobs:
                    # Ensure input_asset_ids is a list
                    if "input_asset_ids" not in job:
                        job["input_asset_ids"] = []
                    elif not isinstance(job["input_asset_ids"], list):
                        job["input_asset_ids"] = [job["input_asset_ids"]]
                    
                    # Validate required fields
                    if "agentType" not in job:
                        raise ValueError(f"Agent job missing required field 'agentType'")
                    if "output_asset_configs" not in job:
                        raise ValueError(f"Agent job missing required field 'output_asset_configs'")
                    
                    # Add default metadata if not present
                    if "metadata" not in job:
                        job["metadata"] = {}
                    if "priority" not in job["metadata"]:
                        job["metadata"]["priority"] = "medium"
                    if "tags" not in job["metadata"]:
                        job["metadata"]["tags"] = []
                    if "estimated_duration" not in job["metadata"]:
                        job["metadata"]["estimated_duration"] = "5m"
                
                # Process direct assets
                for asset in direct_assets:
                    if "asset_id" not in asset:
                        asset["asset_id"] = str(uuid.uuid4())
                    if "metadata" not in asset:
                        asset["metadata"] = {}
                    if "createdAt" not in asset["metadata"]:
                        asset["metadata"]["createdAt"] = datetime.now().isoformat()
                    if "updatedAt" not in asset["metadata"]:
                        asset["metadata"]["updatedAt"] = datetime.now().isoformat()
                    if "creator" not in asset["metadata"]:
                        asset["metadata"]["creator"] = "bot"
                    if "version" not in asset["metadata"]:
                        asset["metadata"]["version"] = 1
                
                return {
                    "final_response": response_data["response"],
                    "agent_jobs": agent_jobs,  # Pass raw agent jobs
                    "assets": direct_assets
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
                metadata["asset_references"] = [asset["asset_id"] for asset in side_effects["assets"]]
            if side_effects.get("agent_jobs"):
                metadata["agent_jobs"] = side_effects["agent_jobs"]
            
        # Add tool use history to metadata if it exists
        if side_effects.get("tool_use_history"):
            metadata["tool_use_history"] = side_effects["tool_use_history"]
            
        return metadata

    def _get_system_prompt(self, assets: List[Asset] = None) -> str:
        """Get the system prompt for the AI service"""
        base_prompt = f"""You are FractalBot, an intelligent assistant that helps users accomplish tasks through a combination of conversation and automated workflows.

CRITICAL: You must ALWAYS respond with a valid JSON object. Your entire response must be a single JSON object, not a mix of text and JSON.
DO NOT wrap your response in markdown code blocks (```json) or any other formatting.
DO NOT include any text before or after the JSON object.

You have two possible response formats: 

1. To use a tool (directly executable by you):
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

2. To give a final response (which can include recommending agent jobs and/or directly generating assets):
{{
    "type": "final_response",
    "response": "Your response text here",
    "agent_jobs": [
        {{
            "agentType": "list_labels|get_messages|get_message|email_summarizer|email_list_summarizer",  // The agentType MUST be one of these exact values
            "input_parameters": {{
                "operation": "list_labels|get_messages|get_message",  // Must match agentType
                // Operation-specific parameters as shown below
            }},
            "input_asset_ids": ["asset_id_1", "asset_id_2"],  // REQUIRED: Array of input asset IDs that this agent will process
            "output_asset_configs": [
                {{
                    "name": "Required name for the output asset",
                    "description": "Description of what this asset will contain",
                    "fileType": "txt|pdf|csv|json|png|jpg|jpeg|gif|mp3|mp4|wav|unknown",
                    "dataType": "unstructured|email_list|generic_list|generic_table"
                }}
            ],
            "description": "Optional description of what this job will do",
            "metadata": {{  // Optional metadata for the job
                "priority": "high|medium|low",
                "tags": ["tag1", "tag2"],
                "estimated_duration": "5m",
                // ... other metadata as needed
            }}
        }}
    ],
    "assets": [  // Optional: For directly generated assets like poems, summaries, etc.
        {{
            "asset_id": "uuid-string",  // Will be auto-generated if not provided
            "name": "Required name for the asset",
            "description": "Description of the asset",
            "fileType": "txt|pdf|csv|json|png|jpg|jpeg|gif|mp3|mp4|wav|unknown",
            "dataType": "unstructured|email_list|generic_list|generic_table",
            "content": "The actual content of the asset",
            "metadata": {{
                "createdAt": "timestamp",
                "updatedAt": "timestamp",
                "creator": "user/bot/agent",
                "tags": ["tag1", "tag2"],
                "agent_associations": ["agent_id1", "agent_id2"],
                "version": 1
            }}
        }}
    ]
}}

IMPORTANT DISTINCTION:
1. Tools (Directly Usable):
   - These are tools you can directly execute in your responses
   - Currently available tools:
{json.dumps(TOOLS, indent=2)}

2. Agent Jobs (Recommendable):
   - These are specialized workers you can recommend to the user
   - You CANNOT directly execute agent jobs
   - You can only propose them in the "agent_jobs" array of a final_response
   - The user must approve and launch them
   
   Available Agent Types:
   - list_labels: Lists all email folders/labels
     * General inputs:
       - agentType: list_labels
       - input_parameters:
       {{
           "operation": "list_labels",
           "include_system_labels": true  // Whether to include system labels like INBOX, SENT, etc.
       }}
       - input_asset_ids: []  // No input assets needed
       - output_asset_configs: [{{  // Will contain the list of labels
           "name": "Email Labels List",
           "description": "List of all email folders and labels",
           "fileType": "json",
           "dataType": "generic_list"
       }}]
     * Example: "I'll create a list_labels agent job to list all your email folders and labels"

   - get_messages: Retrieves messages from specified folders
     * General inputs:
       - agentType: get_messages
       - input_parameters:
       {{
           "operation": "get_messages",
           "folders": ["folder1", "folder2"],  // List of folder o label IDs to search (must be IDs and not names)
           "date_range": {{
               "start": "2024-03-01T00:00:00Z",  // ISO 8601 format
               "end": "2024-03-23T23:59:59Z"     // ISO 8601 format
           }},
           "query_terms": ["term1", "term2"],    // Optional search terms
           "max_results": 100,                   // Maximum number of emails to retrieve
           "include_attachments": false,         // Whether to include email attachments
           "include_metadata": true              // Whether to include email metadata (headers, etc.)
       }}
       - input_asset_ids: []  // No input assets needed
       - output_asset_configs: [{{  // Will contain the retrieved messages
           "name": "Retrieved Emails",
           "description": "List of emails matching the search criteria",
           "fileType": "json",
           "dataType": "email_list"
       }}]
     * Example: "I'll create a get_messages agent job to retrieve your recent work emails from the past month"

   - get_message: Retrieves a specific message by ID
     * General inputs:
       - agentType: get_message
       - input_parameters:
       {{
           "operation": "get_message",
           "message_id": "message_id_here",      // The ID of the specific message
           "include_attachments": true,          // Whether to include email attachments
           "include_metadata": true              // Whether to include email metadata
       }}
       - input_asset_ids: []  // No input assets needed
       - output_asset_configs: [{{  // Will contain the specific message
           "name": "Retrieved Email",
           "description": "The specific email message with ID",
           "fileType": "json",
           "dataType": "email_list"
       }}]
     * Example: "I'll create a get_message agent job to retrieve the specific email with ID 'abc123'"

   - email_summarizer: Creates a summary of a single email message
     * General inputs:
       - agentType: email_summarizer
       - input_parameters: {{}}  // No parameters needed
       - input_asset_ids: ["email_asset_id"]  // REQUIRED: ID of the email asset to summarize
       - output_asset_configs: [{{  // Will contain the email summary
           "name": "Email Summary",
           "description": "Summary of the email message",
           "fileType": "txt",
           "dataType": "unstructured"
       }}]
     * Example: "I'll create an email_summarizer agent job to summarize this email"

   - email_list_summarizer: Creates summaries of multiple email messages
     * General inputs:
       - agentType: email_list_summarizer
       - input_parameters: {{}}  // No parameters needed
       - input_asset_ids: ["email_list_asset_id"]  // REQUIRED: ID of the email list asset to summarize
       - output_asset_configs: [{{  // Will contain the list of email summaries
           "name": "Email List Summary",
           "description": "Summaries of multiple email messages",
           "fileType": "json",
           "dataType": "generic_list"  // Each item in the list will have: email_id, subject, from, to, date, and summary
       }}]
     * Example: "I'll create an email_list_summarizer agent job to summarize these emails"

3. Direct Asset Generation:
   - You can directly generate assets in your final response
   - Use the "assets" array in your final_response
   - Include all required fields (name, description, fileType, dataType, content)
   - Example: Generating a poem
     {{
         "type": "final_response",
         "response": "Here's a poem I wrote for you:",
         "assets": [
             {{
                 "name": "Generated Poem",
                 "description": "A poem generated by the bot",
                 "fileType": "txt",
                 "dataType": "unstructured",
                 "content": "Roses are red...",
                 "metadata": {{
                     "createdAt": "2024-03-23T12:00:00Z",
                     "creator": "bot",
                     "tags": ["poem", "generated"]
                 }}
             }}
         ]
     }}

CRITICAL: When recommending an agent job, you MUST do TWO things:
1. Add the agent job to the "agent_jobs" array in your response with:
   - agentType: MUST be one of: list_labels, get_messages, or get_message
   - input_parameters object with:
     * operation: The specific operation to perform (must match agentType)
     * Operation-specific parameters as shown above
   - output_asset_configs: Array of asset configurations that will be created

2. EXPLAIN THE AGENT JOB IN YOUR RESPONSE TEXT. This is MANDATORY. Include:
   - Which operation it will perform
   - All relevant parameters and their values
   - What outputs it will produce
   - How it will help solve the user's problem

Asset Types:
- fileType: The format of the file (txt, pdf, csv, json, png, jpg, jpeg, gif, mp3, mp4, wav, unknown)
- dataType: The type of structured data (unstructured, email_list, generic_list, generic_table)"""

        if assets:
            # Add current assets to the system prompt
            assets_section = "\n\nCurrent Assets Available:\n"
            for asset in assets:
                assets_section += f"""
Asset ID: {asset.asset_id}
Name: {asset.name}
Description: {asset.description or 'No description provided'}
File Type: {asset.fileType}
Data Type: {asset.dataType}
Content: {asset.content}
Metadata: {json.dumps(asset.metadata, indent=2)}
"""
            base_prompt += assets_section

        return base_prompt 