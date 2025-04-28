from typing import Dict, Any, List
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from .base_prompt import BasePrompt

class Step(BaseModel):
    """Structure for a single step in the workflow"""
    description: str = Field(description="Description of what this step does")
    tool_id: str = Field(description="ID of the tool to use for this step, or 'deferred' if tool assignment is deferred")
    inputs: List[str] = Field(description="List of inputs required for this step")
    outputs: List[str] = Field(description="List of outputs produced by this step")

class StepsGenerator(BaseModel):
    """Structure for steps generator"""
    steps: List[Step] = Field(description="List of steps in the workflow")
    is_single_tool_solution: bool = Field(description="Whether the task can be solved by a single tool")
    explanation: str = Field(description="Explanation of why this decomposition was chosen")

class StepsGeneratorPrompt(BasePrompt):
    """Prompt template for steps generator"""
    
    def __init__(self):
        super().__init__(StepsGenerator)
        
        self.system_message = """You are an AI assistant that specializes in task decomposition and workflow planning. Your job is to analyze tasks and either:
1. Find a single tool that can accomplish the task directly, or
2. Break down the task into smaller subtasks that can be chained together to achieve the goal.

When analyzing a task:
1. First check if any single tool can handle the entire task by matching its inputs and outputs
2. If no single tool can handle it, decompose the task into smaller steps where:
   - Each step's inputs should be either:
     a) Available from the original task inputs
     b) Produced as outputs from previous steps
   - The final step's outputs should match the desired task outputs
   - Tool assignments can be deferred for complex decompositions

Your response should explain your reasoning and provide a clear workflow of steps."""

        self.user_message_template = """Task Analysis Request:

Goal: {goal}

Required Inputs:
{inputs}

Desired Outputs:
{outputs}

Available Tools:
{tools}

Please analyze this task and either:
1. Find a single tool that can accomplish it directly, or
2. Break it down into smaller steps that can be chained together.

{format_instructions}"""

    def get_prompt_template(self) -> ChatPromptTemplate:
        """Return a ChatPromptTemplate for steps generation"""
        return ChatPromptTemplate.from_messages([
            ("system", self.system_message),
            ("human", self.user_message_template)
        ]) 