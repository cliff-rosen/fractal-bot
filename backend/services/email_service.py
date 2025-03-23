from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import base64
import email
from email.mime.text import MIMEText
import os
from config.settings import settings
from schemas.email import (
    EmailLabel,
    EmailMessage,
    EmailThread,
    EmailSearchParams,
    EmailAgentResponse,
    EmailLabelType
)
from sqlalchemy.orm import Session
from models import GoogleOAuth2Credentials

logger = logging.getLogger(__name__)

class EmailService:
    """Service for interacting with Google Mail API"""
    
    def __init__(self):
        self.SCOPES = [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.labels',
            'https://www.googleapis.com/auth/gmail.metadata'
        ]
        self.service = None
        self.credentials = None
        
    async def authenticate(self, user_id: str, db: Session) -> bool:
        """
        Authenticate with Google Mail API using stored credentials
        
        Args:
            user_id: ID of the user to authenticate for
            db: Database session
            
        Returns:
            bool: Whether authentication was successful
        """
        try:
            # Get credentials from database
            db_credentials = db.query(GoogleOAuth2Credentials).filter(
                GoogleOAuth2Credentials.user_id == user_id
            ).first()
            
            if not db_credentials:
                logger.error(f"No Google credentials found for user {user_id}")
                return False
                
            # Check if token needs refresh
            if db_credentials.expiry and db_credentials.expiry <= datetime.utcnow():
                logger.info("Refreshing expired Google OAuth2 token")
                credentials = Credentials(
                    token=db_credentials.token,
                    refresh_token=db_credentials.refresh_token,
                    token_uri=db_credentials.token_uri,
                    client_id=db_credentials.client_id,
                    client_secret=db_credentials.client_secret,
                    scopes=db_credentials.scopes
                )
                
                # Refresh the token
                credentials.refresh(Request())
                
                # Update credentials in database
                db_credentials.token = credentials.token
                db_credentials.expiry = credentials.expiry
                db.commit()
            else:
                credentials = Credentials(
                    token=db_credentials.token,
                    refresh_token=db_credentials.refresh_token,
                    token_uri=db_credentials.token_uri,
                    client_id=db_credentials.client_id,
                    client_secret=db_credentials.client_secret,
                    scopes=db_credentials.scopes
                )
            
            # Build the Gmail API service
            self.service = build('gmail', 'v1', credentials=credentials)
            self.credentials = credentials
            return True
            
        except Exception as e:
            logger.error(f"Error authenticating with Gmail API: {str(e)}")
            return False
            
    async def list_labels(self, include_system_labels: bool = True) -> EmailAgentResponse:
        """
        List all email labels/folders
        
        Args:
            include_system_labels: Whether to include system labels like INBOX, SENT, etc.
            
        Returns:
            EmailAgentResponse with list of labels
        """
        try:
            if not self.service:
                return EmailAgentResponse(
                    success=False,
                    error="Not authenticated with Gmail API"
                )
                
            # Get labels from Gmail API
            results = self.service.users().labels().list(userId='me').execute()
            labels = results.get('labels', [])
            
            # Transform labels to our schema
            email_labels = []
            for label in labels:
                # Skip system labels if not requested
                if not include_system_labels and label['type'] == 'system':
                    continue
                    
                email_labels.append(EmailLabel(
                    id=label['id'],
                    name=label['name'],
                    type=EmailLabelType(label['type']),
                    message_list_visibility=label.get('messageListVisibility'),
                    label_list_visibility=label.get('labelListVisibility'),
                    messages_total=label.get('messagesTotal'),
                    messages_unread=label.get('messagesUnread'),
                    threads_total=label.get('threadsTotal'),
                    threads_unread=label.get('threadsUnread')
                ))
                
            return EmailAgentResponse(
                success=True,
                data={'labels': [label.dict() for label in email_labels]},
                metadata={'total_labels': len(email_labels)}
            )
            
        except HttpError as e:
            logger.error(f"Gmail API error listing labels: {str(e)}")
            return EmailAgentResponse(
                success=False,
                error=f"Gmail API error: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Error listing labels: {str(e)}")
            return EmailAgentResponse(
                success=False,
                error=f"Error listing labels: {str(e)}"
            )
            
    async def get_messages(self, params: EmailSearchParams) -> EmailAgentResponse:
        """
        Get messages matching the search parameters
        
        Args:
            params: Search parameters for finding messages
            
        Returns:
            EmailAgentResponse with list of messages
        """
        try:
            if not self.service:
                return EmailAgentResponse(
                    success=False,
                    error="Not authenticated with Gmail API"
                )
                
            # Build search query
            query_parts = []
            
            # Add folder/label filters
            if params.folders:
                query_parts.append(f"({' OR '.join(f'in:{folder}' for folder in params.folders)})")
                
            # Add date range filter
            if params.date_range:
                start = params.date_range.get('start')
                end = params.date_range.get('end')
                if start:
                    query_parts.append(f"after:{int(start.timestamp())}")
                if end:
                    query_parts.append(f"before:{int(end.timestamp())}")
                    
            # Add search terms
            if params.query_terms:
                query_parts.extend(params.query_terms)
                
            # Combine all query parts
            query = ' '.join(query_parts)
            
            # Get messages from Gmail API
            results = self.service.users().messages().list(
                userId='me',
                q=query,
                maxResults=params.max_results
            ).execute()
            
            messages = results.get('messages', [])
            
            # Get full message details
            email_messages = []
            for msg in messages:
                message = self.service.users().messages().get(
                    userId='me',
                    id=msg['id'],
                    format='full'
                ).execute()
                
                # Parse message headers
                headers = {}
                for header in message['payload']['headers']:
                    headers[header['name']] = header['value']
                    
                # Get message body
                body = None
                body_html = None
                attachments = []
                
                if 'parts' in message['payload']:
                    for part in message['payload']['parts']:
                        if part['mimeType'] == 'text/plain':
                            body = base64.urlsafe_b64decode(part['body']['data']).decode()
                        elif part['mimeType'] == 'text/html':
                            body_html = base64.urlsafe_b64decode(part['body']['data']).decode()
                        elif 'filename' in part:
                            attachments.append({
                                'id': part['body'].get('attachmentId'),
                                'filename': part['filename'],
                                'mime_type': part['mimeType'],
                                'size': part['body'].get('size', 0)
                            })
                elif 'body' in message['payload']:
                    body = base64.urlsafe_b64decode(message['payload']['body']['data']).decode()
                    
                email_messages.append(EmailMessage(
                    id=message['id'],
                    thread_id=message['threadId'],
                    label_ids=message['labelIds'],
                    snippet=message['snippet'],
                    headers=headers,
                    body=body,
                    body_html=body_html,
                    attachments=attachments,
                    internal_date=datetime.fromtimestamp(int(message['internalDate'])/1000),
                    size_estimate=message['sizeEstimate'],
                    history_id=message['historyId']
                ))
                
            return EmailAgentResponse(
                success=True,
                data={'messages': [msg.dict() for msg in email_messages]},
                metadata={
                    'total_messages': len(email_messages),
                    'query': query
                }
            )
            
        except HttpError as e:
            logger.error(f"Gmail API error getting messages: {str(e)}")
            return EmailAgentResponse(
                success=False,
                error=f"Gmail API error: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Error getting messages: {str(e)}")
            return EmailAgentResponse(
                success=False,
                error=f"Error getting messages: {str(e)}"
            )
            
    async def get_message(self, message_id: str, include_attachments: bool = False) -> EmailAgentResponse:
        """
        Get a specific message by ID
        
        Args:
            message_id: ID of the message to retrieve
            include_attachments: Whether to include attachment data
            
        Returns:
            EmailAgentResponse with message details
        """
        try:
            if not self.service:
                return EmailAgentResponse(
                    success=False,
                    error="Not authenticated with Gmail API"
                )
                
            # Get message from Gmail API
            message = self.service.users().messages().get(
                userId='me',
                id=message_id,
                format='full'
            ).execute()
            
            # Parse message headers
            headers = {}
            for header in message['payload']['headers']:
                headers[header['name']] = header['value']
                
            # Get message body and attachments
            body = None
            body_html = None
            attachments = []
            
            if 'parts' in message['payload']:
                for part in message['payload']['parts']:
                    if part['mimeType'] == 'text/plain':
                        body = base64.urlsafe_b64decode(part['body']['data']).decode()
                    elif part['mimeType'] == 'text/html':
                        body_html = base64.urlsafe_b64decode(part['body']['data']).decode()
                    elif 'filename' in part:
                        attachment_data = None
                        if include_attachments and 'attachmentId' in part['body']:
                            attachment = self.service.users().messages().attachments().get(
                                userId='me',
                                messageId=message_id,
                                id=part['body']['attachmentId']
                            ).execute()
                            attachment_data = base64.urlsafe_b64decode(attachment['data'])
                            
                        attachments.append({
                            'id': part['body'].get('attachmentId'),
                            'filename': part['filename'],
                            'mime_type': part['mimeType'],
                            'size': part['body'].get('size', 0),
                            'data': attachment_data
                        })
            elif 'body' in message['payload']:
                body = base64.urlsafe_b64decode(message['payload']['body']['data']).decode()
                
            email_message = EmailMessage(
                id=message['id'],
                thread_id=message['threadId'],
                label_ids=message['labelIds'],
                snippet=message['snippet'],
                headers=headers,
                body=body,
                body_html=body_html,
                attachments=attachments,
                internal_date=datetime.fromtimestamp(int(message['internalDate'])/1000),
                size_estimate=message['sizeEstimate'],
                history_id=message['historyId']
            )
            
            return EmailAgentResponse(
                success=True,
                data={'message': email_message.dict()},
                metadata={
                    'has_attachments': len(attachments) > 0,
                    'attachment_count': len(attachments)
                }
            )
            
        except HttpError as e:
            logger.error(f"Gmail API error getting message: {str(e)}")
            return EmailAgentResponse(
                success=False,
                error=f"Gmail API error: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Error getting message: {str(e)}")
            return EmailAgentResponse(
                success=False,
                error=f"Error getting message: {str(e)}"
            ) 