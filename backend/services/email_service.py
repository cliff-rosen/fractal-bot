from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
from sqlalchemy.orm import Session
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from models import GoogleOAuth2Credentials
from config.settings import settings

logger = logging.getLogger(__name__)

class EmailService:
    SCOPES = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.metadata',
        'openid',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ]

    def __init__(self):
        self.service = None
        self.credentials = None

    async def authenticate(self, user_id: int, db: Session) -> bool:
        """
        Authenticate with Gmail API using stored credentials
        
        Args:
            user_id: User ID
            db: Database session
            
        Returns:
            bool: True if authentication successful, False otherwise
        """
        try:
            # Get credentials from database
            db_credentials = db.query(GoogleOAuth2Credentials).filter(
                GoogleOAuth2Credentials.user_id == user_id
            ).first()
            
            if not db_credentials:
                logger.error(f"No credentials found for user {user_id}")
                return False
                
            # Create credentials object
            self.credentials = Credentials(
                token=db_credentials.token,
                refresh_token=db_credentials.refresh_token,
                token_uri=db_credentials.token_uri,
                client_id=db_credentials.client_id,
                client_secret=db_credentials.client_secret,
                scopes=db_credentials.scopes
            )
            
            # Refresh token if expired
            if self.credentials.expired:
                self.credentials.refresh(Request())
                
                # Update database with new token
                db_credentials.token = self.credentials.token
                db_credentials.expiry = self.credentials.expiry
                db.commit()
            
            # Build Gmail API service
            self.service = build('gmail', 'v1', credentials=self.credentials)
            return True
            
        except Exception as e:
            logger.error(f"Error authenticating with Gmail API: {str(e)}")
            return False

    async def list_labels(self, include_system_labels: bool = True) -> List[Dict[str, Any]]:
        """
        List all email labels/folders
        
        Args:
            include_system_labels: Whether to include system labels
            
        Returns:
            List of label objects
        """
        try:
            if not self.service:
                raise ValueError("Service not initialized. Call authenticate first.")
                
            results = self.service.users().labels().list(userId='me').execute()
            labels = results.get('labels', [])
            
            if not include_system_labels:
                # Filter out system labels
                labels = [label for label in labels if label['type'] != 'system']
                
            return labels
            
        except HttpError as e:
            logger.error(f"Error listing labels: {str(e)}")
            raise

    async def get_messages(
        self,
        folders: Optional[List[str]] = None,
        date_range: Optional[Dict[str, datetime]] = None,
        query_terms: Optional[List[str]] = None,
        max_results: int = 100,
        include_attachments: bool = False,
        include_metadata: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Get messages from specified folders
        
        Args:
            folders: List of folder/label IDs
            date_range: Dict with 'start' and 'end' datetime objects
            query_terms: List of search terms
            max_results: Maximum number of results to return
            include_attachments: Whether to include attachment data
            include_metadata: Whether to include message metadata
            
        Returns:
            List of message objects
        """
        try:
            if not self.service:
                raise ValueError("Service not initialized. Call authenticate first.")
                
            # Build search query
            query_parts = []
            
            if folders:
                folder_query = ' OR '.join(f'label:{folder}' for folder in folders)
                query_parts.append(f'({folder_query})')
                
            if date_range:
                if date_range.get('start'):
                    query_parts.append(f'after:{int(date_range["start"].timestamp())}')
                if date_range.get('end'):
                    query_parts.append(f'before:{int(date_range["end"].timestamp())}')
                    
            if query_terms:
                query_parts.extend(query_terms)
                
            query = ' '.join(query_parts) if query_parts else None
            
            # Get messages
            results = self.service.users().messages().list(
                userId='me',
                q=query,
                maxResults=max_results
            ).execute()
            
            messages = results.get('messages', [])
            detailed_messages = []
            
            for msg in messages:
                message = await self.get_message(
                    msg['id'],
                    include_attachments=include_attachments,
                    include_metadata=include_metadata
                )
                detailed_messages.append(message)
                
            return detailed_messages
            
        except HttpError as e:
            logger.error(f"Error getting messages: {str(e)}")
            raise

    async def get_message(
        self,
        message_id: str,
        include_attachments: bool = False,
        include_metadata: bool = True
    ) -> Dict[str, Any]:
        """
        Get a specific message by ID
        
        Args:
            message_id: Message ID
            include_attachments: Whether to include attachment data
            include_metadata: Whether to include message metadata
            
        Returns:
            Message object
        """
        try:
            if not self.service:
                raise ValueError("Service not initialized. Call authenticate first.")
                
            # Get message details
            message = self.service.users().messages().get(
                userId='me',
                id=message_id,
                format='full'
            ).execute()
            
            # Parse message parts
            headers = {}
            body = None
            attachments = []
            
            if 'payload' in message:
                payload = message['payload']
                
                # Get headers
                if 'headers' in payload:
                    headers = {
                        header['name'].lower(): header['value']
                        for header in payload['headers']
                    }
                
                # Get body and attachments
                if 'parts' in payload:
                    for part in payload['parts']:
                        if part.get('mimeType') == 'text/plain':
                            if 'data' in part['body']:
                                body = part['body']['data']
                        elif part.get('filename'):
                            attachment = {
                                'id': part['body'].get('attachmentId'),
                                'filename': part['filename'],
                                'mimeType': part['mimeType'],
                                'size': part['body'].get('size')
                            }
                            if include_attachments and attachment['id']:
                                attachment['data'] = self.service.users().messages().attachments().get(
                                    userId='me',
                                    messageId=message_id,
                                    id=attachment['id']
                                ).execute()['data']
                            attachments.append(attachment)
                            
            return {
                'id': message['id'],
                'threadId': message['threadId'],
                'labelIds': message.get('labelIds', []),
                'snippet': message.get('snippet', ''),
                'headers': headers if include_metadata else None,
                'body': body,
                'attachments': attachments if include_attachments else [],
                'internalDate': message.get('internalDate'),
                'sizeEstimate': message.get('sizeEstimate'),
                'historyId': message.get('historyId'),
                'raw': message.get('raw') if include_metadata else None
            }
            
        except HttpError as e:
            logger.error(f"Error getting message {message_id}: {str(e)}")
            raise 