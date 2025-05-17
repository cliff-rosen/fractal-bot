from typing import Dict, Any, List
import logging
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
import os

logger = logging.getLogger(__name__)

class NewsletterExtractionResponse(BaseModel):
    """Structure for newsletter extraction response"""
    basics: Dict[str, str] = Field(
        description="Basic information about the newsletter",
        default_factory=lambda: {"source": "", "date": ""}
    )
    findings: Dict[str, List[str]] = Field(
        description="Key findings from the newsletter",
        default_factory=lambda: {
            "model_capabilities": [],
            "new_releases": [],
            "tools_workflows": [],
            "market_adoption": [],
            "use_cases": [],
            "implementation_insights": []
        }
    )
    top_takeaways: List[str] = Field(
        description="The 2-3 most significant developments from this newsletter"
    )

class NewsletterExtractionPrompt:
    """Prompt template for newsletter extraction"""
    
    def __init__(self):
        self.system_message = """You are an expert at analyzing newsletter articles and extracting structured information about AI developments. Your task is to identify and categorize key information about:
1. Model capabilities and advancements
2. New releases and updates
3. Tools and workflows
4. Market adoption and trends
5. Notable use cases
6. Implementation insights

Focus on concrete developments rather than speculation. For each category, provide specific, factual information found in the article. If no relevant information is found for a category, include "none found"."""

        self.user_message_template = """Please analyze the following newsletter article and extract the key information into a structured format.

Article for extraction:
Source: {source}
Date: {date}

{content}

{format_instructions}"""

    def get_prompt_template(self) -> ChatPromptTemplate:
        """Return a ChatPromptTemplate for newsletter extraction"""
        return ChatPromptTemplate.from_messages([
            ("system", self.system_message),
            ("human", self.user_message_template)
        ])

    def get_formatted_prompt(self, content: str, source: str, date: str, format_instructions: str) -> ChatPromptTemplate:
        """Get a formatted prompt template with all necessary variables"""
        return self.get_prompt_template().format(
            content=content,
            source=source,
            date=date,
            format_instructions=format_instructions
        )

class NewsletterExtractionService:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o",
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.prompt = NewsletterExtractionPrompt()
        
    async def extract_from_newsletter(
        self,
        content: str,
        source: str,
        date: str
    ) -> Dict[str, Any]:
        """
        Extract structured information from a newsletter article using AI
        
        Args:
            content: The newsletter article content
            source: The source of the newsletter
            date: The date of the newsletter
            
        Returns:
            Dictionary containing extracted information in structured format
        """
        try:
            # Get format instructions from Pydantic model
            response_model = NewsletterExtractionResponse
            format_instructions = response_model.schema_json(indent=2)
            
            # Create and format the prompt
            formatted_prompt = self.prompt.get_formatted_prompt(
                content=content,
                source=source,
                date=date,
                format_instructions=format_instructions
            )
            
            # Get extraction from LLM
            response = await self.llm.ainvoke(formatted_prompt)
            
            # Parse the response as JSON
            import json
            try:
                extraction = json.loads(response.content)
                
                # Validate against Pydantic model
                validated_extraction = NewsletterExtractionResponse(**extraction)
                
                # Ensure the basics are filled in
                validated_extraction.basics = {
                    'source': source,
                    'date': date
                }
                
                return validated_extraction.dict()
                
            except json.JSONDecodeError as e:
                logger.error(f"Error parsing LLM response as JSON: {str(e)}")
                logger.error(f"Raw response: {response.content}")
                raise ValueError("Failed to parse LLM response as valid JSON")
            except Exception as e:
                logger.error(f"Error validating extraction: {str(e)}")
                raise ValueError(f"Failed to validate extraction: {str(e)}")
                
        except Exception as e:
            logger.error(f"Error extracting from newsletter: {str(e)}")
            raise 