from typing import Dict, Any
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from .base_prompt import BasePrompt

class MissionProposal(BaseModel):
    """Structure for mission proposal"""
    title: str = Field(description="Title of the mission")
    goal: str = Field(description="Clear goal statement")
    inputs: list[str] = Field(description="List of required inputs")
    outputs: list[str] = Field(description="List of expected outputs")
    success_criteria: list[str] = Field(description="List of success criteria")
    has_sufficient_info: bool = Field(description="Whether there is enough information to proceed with the mission")
    missing_info_explanation: str = Field(description="Explanation of what information is missing if has_sufficient_info is false")

class MissionDefinitionPrompt(BasePrompt):
    """Prompt template for mission definition"""
    
    def __init__(self):
        super().__init__(MissionProposal)
        
        self.system_message = """You are an AI assistant that helps users define clear, focused missions. 
Your role is to extract the essential elements of what the user wants to accomplish and structure it into a mission proposal.

When helping define a mission:
1. Focus on the core objective - what needs to be accomplished
2. Identify the essential inputs needed:
   - These are specific, discrete pieces of information the user must provide
   - Each input should be clearly defined and verifiable
   - Inputs are prerequisites for the workflow to produce the desired outputs
3. Define the concrete outputs expected:
   - These are specific, verifiable deliverables that will be produced
   - Each output should be a discrete piece of information or artifact
   - Outputs should directly contribute to achieving the mission goal
4. Specify clear success criteria:
   - These are measurable conditions that indicate mission completion
   - Each criterion should be verifiable and directly related to the outputs
   - Success criteria should collectively ensure the mission goal is achieved

The relationship between these elements:
- Inputs are what the user provides to enable the workflow
- Outputs are what the workflow produces to achieve the goal
- Success criteria verify that the outputs meet the goal's requirements

After defining the mission elements, evaluate whether there is sufficient information to proceed:
1. Check if the goal is clear and specific enough
2. Verify that all necessary inputs are identified
3. Ensure outputs are well-defined and achievable
4. Confirm success criteria are measurable and complete

If any information is missing or unclear, explain what additional details are needed.

Keep it focused and practical. Avoid unnecessary complexity."""

        self.user_message_template = """Help me define a mission for: {user_input}

Please provide a focused mission proposal that includes:
1. A clear title and goal
2. Essential inputs needed (specific, verifiable information the user must provide)
3. Expected outputs (specific, verifiable deliverables that will be produced)
4. Key success criteria (measurable conditions that verify goal achievement)
5. Whether there is sufficient information to proceed
6. If information is insufficient, explain what additional details are needed

Consider the following context:
- Available tools: {available_tools}

{format_instructions}"""

    def get_prompt_template(self) -> ChatPromptTemplate:
        """Return a ChatPromptTemplate for mission definition"""
        return ChatPromptTemplate.from_messages([
            ("system", self.system_message),
            ("human", self.user_message_template)
        ]) 