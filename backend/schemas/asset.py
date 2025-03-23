from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum

class AssetType(str, Enum):
    TEXT = "text"
    SPREADSHEET = "spreadsheet"
    PDF = "pdf"
    DATA = "data"

class AssetStatus(str, Enum):
    PROPOSED = "proposed"
    PENDING = "pending"
    READY = "ready"
    ERROR = "error"

class AgentType(str, Enum):
    DATA_COLLECTION = "data_collection"
    INFORMATION_RETRIEVAL = "information_retrieval"
    ANALYSIS = "analysis"

class AgentStatus(str, Enum):
    PROPOSED = "proposed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ERROR = "error"

class ActionType(str, Enum):
    APPROVE_AGENT = "approve_agent"
    REJECT_AGENT = "reject_agent"
    LAUNCH_AGENT = "launch_agent"
    MODIFY_ASSET = "modify_asset"
    NEXT_STEP = "next_step"

class ActionButton(BaseModel):
    id: str
    label: str
    action: ActionType
    data: Optional[Dict[str, Any]] = None

class Asset(BaseModel):
    asset_id: str
    type: AssetType
    content: Optional[Any] = None
    metadata: Dict[str, Any] = {
        "status": AssetStatus.PROPOSED,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now(),
        "creator": None,
        "tags": [],
        "agent_associations": [],
        "version": 1
    }

class Agent(BaseModel):
    agent_id: str
    type: AgentType
    description: str
    status: AgentStatus
    metadata: Dict[str, Any] = {
        "createdAt": datetime.now(),
        "lastRunAt": None,
        "completionTime": None,
        "progress": 0,
        "estimatedCompletion": None
    }
    input_asset_ids: List[str] = []
    output_asset_ids: List[str] = [] 