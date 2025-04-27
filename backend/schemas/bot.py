from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
from datetime import datetime
from enum import Enum

### ASSETS ###
class Asset(BaseModel):
    id: str
    name: str
    description: str
    status: str
    created_at: datetime
    updated_at: datetime

### TOOLS ###

class SchemaType(BaseModel):
    type: str
    is_array: bool
    name: str
    description: str

class ToolStep(BaseModel):
    name: str
    description: str
    tool_id: str
    inputs: List[SchemaType]
    outputs: List[SchemaType]

class Tool(BaseModel):
    id: str
    name: str
    description: str
    category: str
    inputs: List[SchemaType]
    outputs: List[SchemaType]
    steps: Optional[List[ToolStep]] = None

### WORKFLOW ###

class Step(BaseModel):
    id: str
    name: str
    description: str
    status: str
    assets: Dict[str, List[str]]
    tool: Optional[Dict[str, Any]] = None
    substeps: Optional[List['Step']] = None
    created_at: datetime
    updated_at: datetime

class Stage(BaseModel):
    id: str
    name: str
    description: str
    status: str
    steps: List['Step']
    assets: List[Asset]
    created_at: datetime
    updated_at: datetime

class Workflow(BaseModel):
    id: str
    name: str
    description: str
    status: str
    stages: List[Stage]
    assets: List[Asset]
    created_at: datetime
    updated_at: datetime

class Mission(BaseModel):
    id: str
    title: str
    description: str
    goal: str
    status: str
    workflow: Workflow
    assets: List[Asset]
    inputs: List[str]
    outputs: List[str]
    created_at: datetime
    updated_at: datetime

### BOT REQUEST ###
### CHAT ###

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class Message(BaseModel):
    id: str = Field(description="Unique identifier for the message")
    role: MessageRole = Field(description="Role of the message sender (user/assistant/system)")
    content: str = Field(description="Content of the message")
    timestamp: str = Field(description="When the message was sent in ISO format")
    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Optional metadata for the message including missionId, stageId, stepId, or assetId"
    )

    @classmethod
    def create(cls, **data):
        if 'timestamp' not in data:
            data['timestamp'] = datetime.utcnow().isoformat()
        elif isinstance(data['timestamp'], datetime):
            data['timestamp'] = data['timestamp'].isoformat()
        return cls(**data)

class ChatResponse(BaseModel):
    message: Message = Field(description="The bot's response message")
    sideEffects: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Optional side effects from the bot's response"
    ) 

class BaseMessage(BaseModel):
    role: str
    content: str
    timestamp: datetime


class BotRequest(BaseModel):
    message: str
    history: List[BaseMessage]
    mission: Mission
    selectedTools: List[Tool]
