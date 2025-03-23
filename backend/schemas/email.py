from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class EmailLabelType(str, Enum):
    """Types of email labels"""
    SYSTEM = "system"  # Built-in labels like INBOX, SENT, etc.
    USER = "user"      # User-created labels
    CATEGORY = "category"  # Gmail categories like Social, Promotions, etc.

class EmailLabel(BaseModel):
    """Schema for email labels/folders"""
    id: str = Field(description="Unique identifier for the label")
    name: str = Field(description="Display name of the label")
    type: EmailLabelType = Field(description="Type of the label")
    color: Optional[str] = Field(description="Label color (if applicable)")
    message_list_visibility: Optional[str] = Field(description="Visibility in message list")
    label_list_visibility: Optional[str] = Field(description="Visibility in label list")
    messages_total: Optional[int] = Field(description="Total number of messages with this label")
    messages_unread: Optional[int] = Field(description="Number of unread messages with this label")
    threads_total: Optional[int] = Field(description="Total number of threads with this label")
    threads_unread: Optional[int] = Field(description="Number of unread threads with this label")

class EmailAttachment(BaseModel):
    """Schema for email attachments"""
    id: str = Field(description="Unique identifier for the attachment")
    filename: str = Field(description="Name of the attachment file")
    mime_type: str = Field(description="MIME type of the attachment")
    size: int = Field(description="Size of the attachment in bytes")
    data: Optional[bytes] = Field(description="Attachment data (if included)")
    url: Optional[str] = Field(description="URL to download the attachment")

class EmailMessage(BaseModel):
    """Schema for email messages"""
    id: str = Field(description="Unique identifier for the message")
    thread_id: str = Field(description="ID of the thread this message belongs to")
    label_ids: List[str] = Field(description="List of label IDs applied to this message")
    snippet: str = Field(description="Short preview of the message content")
    headers: Dict[str, str] = Field(description="Email headers (From, To, Subject, etc.)")
    body: Optional[str] = Field(description="Message body content")
    body_html: Optional[str] = Field(description="HTML version of the message body")
    attachments: List[EmailAttachment] = Field(default_factory=list, description="List of attachments")
    internal_date: datetime = Field(description="Internal timestamp of the message")
    size_estimate: int = Field(description="Estimated size of the message in bytes")
    history_id: str = Field(description="History ID for tracking changes")
    raw: Optional[str] = Field(description="Raw RFC822 message data")

class EmailThread(BaseModel):
    """Schema for email threads"""
    id: str = Field(description="Unique identifier for the thread")
    message_ids: List[str] = Field(description="List of message IDs in this thread")
    snippet: str = Field(description="Short preview of the thread content")
    history_id: str = Field(description="History ID for tracking changes")
    messages: Optional[List[EmailMessage]] = Field(description="Full message objects (if expanded)")
    label_ids: List[str] = Field(description="List of label IDs applied to this thread")

class EmailSearchParams(BaseModel):
    """Schema for email search parameters"""
    folders: List[str] = Field(description="List of folders/labels to search in")
    date_range: Optional[Dict[str, datetime]] = Field(description="Date range for search")
    query_terms: Optional[List[str]] = Field(description="Search terms to match")
    max_results: int = Field(default=100, description="Maximum number of results to return")
    include_attachments: bool = Field(default=False, description="Whether to include attachments")
    include_metadata: bool = Field(default=True, description="Whether to include message metadata")

class EmailAgentResponse(BaseModel):
    """Schema for email agent execution results"""
    success: bool = Field(description="Whether the operation was successful")
    error: Optional[str] = Field(description="Error message if operation failed")
    data: Optional[Dict[str, Any]] = Field(description="Operation results")
    metadata: Optional[Dict[str, Any]] = Field(description="Additional metadata about the operation") 