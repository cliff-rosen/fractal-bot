from typing import Dict, Any
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from .base_prompt import BasePrompt

class MissionProposal(BaseModel):
    """Structure for mission proposal"""
    title: str = Field(description="Clear, concise title describing the mission")
    description: str = Field(description="Detailed explanation of what the mission entails")
    goal: str = Field(description="Specific, measurable objective to be achieved")
    inputs: list[str] = Field(description="Specific data objects that must be provided to start the mission")
    resources: list[str] = Field(description="General resources needed but not specific data objects (e.g. access to email, databases)")
    outputs: list[str] = Field(description="Specific deliverables that will be produced")
    success_criteria: list[str] = Field(description="Measurable conditions that verify mission completion")
    has_sufficient_info: bool = Field(description="Whether there is enough information to proceed with the mission")
    missing_info_explanation: str = Field(description="Explanation of what information is missing if has_sufficient_info is false")

class MissionDefinitionPrompt(BasePrompt):
    """Prompt template for mission definition"""
    
    def __init__(self):
        super().__init__(MissionProposal)
        
        self.system_message = """You are the mission specialist for FractalBot, responsible for defining clear, achievable missions that follow a strict chain of responsibility.

Your core responsibility is to ensure that every mission has a clear chain of responsibility from inputs to outputs, with verifiable success criteria. This means:

1. Every output must be traceable back to specific inputs
2. Every success criterion must be measurable against specific outputs
3. Every input must be necessary for producing the outputs
4. Every resource must be clearly identified and available

When defining a mission, follow this chain of responsibility:

1. Start with the Goal:
   - What is the specific, measurable objective?
   - What will success look like?
   - What are the key deliverables?

2. Define the Outputs:
   - What specific deliverables will be produced?
   - How will each deliverable be structured?
   - What format will each deliverable take?
   - How will each deliverable be verified?

3. Identify Required Inputs:
   - What specific data objects are needed?
   - What format must the inputs be in?
   - Are all inputs available and accessible?
   - Can we trace each output back to its inputs?

4. List Required Resources:
   - What external systems are needed?
   - What tools or capabilities are required?
   - Are all resources available and accessible?
   - How will resources be accessed?

5. Define Success Criteria:
   - How will we verify each output?
   - What metrics will we use?
   - What quality standards must be met?
   - How will we know the mission is complete?

Remember:
- Every output must be justified by specific inputs
- Every success criterion must be measurable
- Every input must be necessary
- Every resource must be available
- The chain of responsibility must be complete and verifiable

Your mission definition sets the foundation for the entire workflow. A clear, well-defined mission with a complete chain of responsibility ensures that:
1. The workflow can be properly designed
2. Progress can be accurately tracked
3. Success can be objectively verified
4. Quality can be maintained throughout"""

        self.user_message_template = """User request: {user_input}

Available tools:
{available_tools}

Please define a mission that follows the chain of responsibility. For each element, explain how it connects to the others:

1. Goal:
   - What is the specific objective?
   - How will we know we've succeeded?

2. Outputs:
   - What will be produced?
   - How will each output be verified?
   - What inputs are needed for each output?

3. Inputs:
   - What specific data is required?
   - How will each input be used?
   - What format is needed?

4. Resources:
   - What external systems are needed?
   - What tools will be used?
   - How will they be accessed?

5. Success Criteria:
   - How will we verify each output?
   - What metrics will we use?
   - What standards must be met?

{format_instructions}"""

    def get_prompt_template(self) -> ChatPromptTemplate:
        """Return a ChatPromptTemplate for mission definition"""
        return ChatPromptTemplate.from_messages([
            ("system", self.system_message),
            ("human", self.user_message_template)
        ]) 