from typing import Dict, Any
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from .base_prompt import BasePrompt

class StepsGenerator(BaseModel):
    """Structure for steps generator"""
    steps: list[str] = Field(description="List of steps")
    inputs: list[str] = Field(description="List of required inputs")
    outputs: list[str] = Field(description="List of expected outputs")

class StepsGeneratorPrompt(BasePrompt):
    """Prompt template for steps generator"""
    
    def __init__(self):
        super().__init__(StepsGenerator)
        
        self.system_message = """You are an AI assistant that 
        
        
        """

        self.user_message_template = """


        
{format_instructions}"""

    def get_prompt_template(self) -> ChatPromptTemplate:
        """Return a ChatPromptTemplate for mission definition"""
        return ChatPromptTemplate.from_messages([
            ("system", self.system_message),
            ("human", self.user_message_template)
        ]) 