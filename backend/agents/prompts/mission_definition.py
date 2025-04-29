from typing import Dict, Any
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from .base_prompt import BasePrompt

class MissionProposal(BaseModel):
    """Structure for mission proposal"""
    title: str = Field(description="Clear, concise title describing the mission")
    goal: str = Field(description="Specific, measurable objective to be achieved")
    inputs: list[str] = Field(description="List of specific data objects that must be provided to start the mission")
    resources: list[str] = Field(description="List of general resources needed but not specific data objects (e.g. access to email, databases)")
    outputs: list[str] = Field(description="List of specific deliverables that will be produced")
    success_criteria: list[str] = Field(description="List of measurable conditions that verify mission completion")
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
   - Each input should be a concrete data object (e.g. a document, dataset, specific information)
   - Inputs are prerequisites for the workflow to produce the desired outputs
3. Identify required resources:
   - Resources are reserves of additional information that may be required to complete the mission
   - Resources can produce data objects via tools but they are not themselves data objects
   - Examples: access to email, databases, APIs
4. Define the concrete outputs expected:
   - These are specific, verifiable deliverables that will be produced
   - Each output should be a discrete piece of information or artifact
   - Outputs should directly contribute to achieving the mission goal
5. Specify clear success criteria:
   - These are measurable conditions that indicate mission completion
   - Each criterion should be verifiable and directly related to the outputs
   - Success criteria should collectively ensure the mission goal is achieved

The relationship between these elements:
- Inputs are specific data objects the user provides to enable the workflow
- Resources are sources of additional information that may be required to complete the mission
- Outputs are what the workflow produces to achieve the goal
- Success criteria verify that the outputs meet the goal's requirements
- Tools are the means by which the workflow produces the outputs from the inputs and works in progress

Key distinctions:
- Inputs vs Resources:
  * Inputs are specific data objects that must be provided
  * Resources are general capabilities needed to process the data
  * Inputs are provided by the user. Resources are accessed via tools
  * Example: For analyzing emails, the emails themselves are inputs, while access to the email system is a resource

After defining the mission elements, RATIONALLY EVALUATE the mission proposal:

1. Feasibility Check:
   - Can the outputs realistically be produced from the given inputs using available tools?
   - Are all necessary resources available and accessible?
   - Are there any technical or practical limitations that need to be addressed?
   - Would a reasonable person understand exactly what needs to be done?

2. Clarity and Completeness:
   - Is the goal specific and unambiguous?
   - Are success criteria measurable and achievable?
   - Are there any contradictions between elements?
   - Are all assumptions clearly stated?
   - Would someone receiving this mission have clear next steps?

3. Scope and Focus:
   - Is the mission scope appropriately bounded?
   - Are there any unnecessary complexities or edge cases?
   - Are all elements directly relevant to the goal?
   - Would someone understand what's NOT included in the mission?

4. Practical Considerations:
   - Are the inputs realistically obtainable?
   - Are the outputs actually useful for the goal?
   - Are success criteria practical to verify?
   - Would someone feel confident they could complete this mission?

If any issues are identified during rationalization:
1. Adjust the mission elements to address the issues
2. Clearly explain any limitations or assumptions
3. Consider breaking down complex missions into simpler ones
4. Ensure the final proposal is both achievable and clear

Keep it focused and practical. Avoid unnecessary complexity."""

        self.user_message_template = """Help me define a mission for: {user_input}

Please provide a focused mission proposal that includes:
1. A clear title and goal
2. Essential inputs needed (specific data objects the user must provide)
3. Required resources (general capabilities needed but not specific data objects)
4. Expected outputs (specific, verifiable deliverables that will be produced)
5. Key success criteria (measurable conditions that verify goal achievement)
6. Rationalization of the mission's feasibility and clarity
7. Whether there is sufficient information to proceed
8. If information is insufficient, explain what additional details are needed

Consider the following context:
- Available tools: {available_tools}

{format_instructions}"""

    def get_prompt_template(self) -> ChatPromptTemplate:
        """Return a ChatPromptTemplate for mission definition"""
        return ChatPromptTemplate.from_messages([
            ("system", self.system_message),
            ("human", self.user_message_template)
        ]) 