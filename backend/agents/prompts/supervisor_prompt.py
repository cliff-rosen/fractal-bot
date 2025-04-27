from typing import List, Dict, Any
from pydantic import BaseModel, Field
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate

class SupervisorResponse(BaseModel):
    """Structure for supervisor's response"""
    response_type: str = Field(description="Type of response: FINAL_ANSWER, MISSION_SPECIALIST, or WORKFLOW_SPECIALIST")
    response_content: str = Field(description="Content of the response - either direct answer or specialist request summary")

class SupervisorPrompt:
    """Prompt template for supervisor"""
    
    def __init__(self):
        self.parser = PydanticOutputParser(pydantic_object=SupervisorResponse)
        self.format_instructions = self.parser.get_format_instructions()
        
        self.system_message = """You are an AI supervisor that helps route user requests to the appropriate specialist or provides direct answers.
Your role is to:
1. Analyze the user's request
2. Determine if it can be answered directly or needs specialist attention
3. If direct answer is possible, provide a clear and helpful response
4. If specialist needed, summarize the request for the specialist in clear, concise terms

Specialists available:
- MISSION_SPECIALIST: For mission planning, goal setting, and task definition
- WORKFLOW_SPECIALIST: For process optimization, workflow design, and execution planning

Choose FINAL_ANSWER when you can provide a complete, accurate response without specialist input."""

        self.user_message_template = """User request: {user_input}

Please analyze this request and provide either:
1. A direct answer (FINAL_ANSWER)
2. A summary for a specialist (MISSION_SPECIALIST or WORKFLOW_SPECIALIST)

{format_instructions}"""

    def get_prompt_template(self) -> ChatPromptTemplate:
        """Return a ChatPromptTemplate for supervisor"""
        return ChatPromptTemplate.from_messages([
            ("system", self.system_message),
            ("human", self.user_message_template)
        ]) 