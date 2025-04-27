from typing import List, Dict, Any
from pydantic import BaseModel, Field
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate

class MissionProposal(BaseModel):
    """Essential structure for a mission proposal"""
    title: str = Field(description="Clear, concise title of the mission")
    goal: str = Field(description="Specific, measurable objective")
    inputs: List[str] = Field(description="Required input materials or data")
    outputs: List[str] = Field(description="Expected deliverables")
    success_criteria: List[str] = Field(description="Key metrics for mission success")

class MissionDefinitionPrompt:
    """Prompt template for mission definition"""
    
    def __init__(self):
        self.parser = PydanticOutputParser(pydantic_object=MissionProposal)
        self.format_instructions = self.parser.get_format_instructions()
        
        self.system_message = """You are an AI assistant that helps users define clear, focused missions. 
Your role is to extract the essential elements of what the user wants to accomplish and structure it into a mission proposal.

When helping define a mission:
1. Focus on the core objective - what needs to be accomplished
2. Identify the essential inputs needed
3. Define the concrete outputs expected
4. Specify clear success criteria

Keep it focused and practical. Avoid unnecessary complexity."""

        self.user_message_template = """Help me define a mission for: {user_input}

Please provide a focused mission proposal that includes:
1. A clear title and goal
2. Essential inputs needed
3. Expected outputs
4. Key success criteria

Consider the following context:
- Available tools: {available_tools}

{format_instructions}"""

    def get_prompt_template(self) -> ChatPromptTemplate:
        """Return a ChatPromptTemplate for mission definition"""
        return ChatPromptTemplate.from_messages([
            ("system", self.system_message),
            ("human", self.user_message_template)
        ]) 