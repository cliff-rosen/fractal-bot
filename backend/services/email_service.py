from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
from sqlalchemy.orm import Session
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from models import GoogleOAuth2Credentials
from schemas.asset import AssetType, AssetStatus
from schemas.email import DateRange
from config.settings import settings
import base64
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

class EmailService:
    SCOPES = [
        'https://www.googleapis.com/auth/gmail.readonly',  # Allows reading emails and performing searches
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

    # Get body - handle different message structures
    def get_body_from_parts(self, parts):
        plain = None
        html = None

        for part in parts:
            # Handle multipart messages
            if part.get('mimeType', '').startswith('multipart/'):
                if 'parts' in part:
                    body = self.get_body_from_parts(part['parts'])
                    if body:
                        return body
            # Handle text/plain
            elif part.get('mimeType') == 'text/plain':
                if 'data' in part['body']:
                    plain = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8', errors='replace')
            # Handle text/html
            elif part.get('mimeType') == 'text/html':
                if 'data' in part['body']:
                    html = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8', errors='replace')
        
        # Return both formats if available
        return {
            'html': html,
            'plain': plain
        }
            
    def get_best_body_from_parts(self, parts):
        plain = None
        html = None

        for part in parts:
            print("********************************************************************`")
            print("part mtype: ", part.get('mimeType', ''))
            mime = part.get('mimeType', '')
            body_data = part.get('body', {}).get('data')

            if mime.startswith('multipart/') and 'parts' in part:
                result = self.get_best_body_from_parts(part['parts'])
                if result:
                    return result

            elif mime == 'text/plain' and body_data and not plain:
                plain = base64.urlsafe_b64decode(body_data).decode('utf-8', errors='replace')

            elif mime == 'text/html' and body_data and not html:
                html_raw = base64.urlsafe_b64decode(body_data).decode('utf-8', errors='replace')
                html = BeautifulSoup(html_raw, "html.parser").get_text(separator="\n")

        return plain or html

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
            include_attachments: Whether to include attachment data (not used)
            include_metadata: Whether to include message metadata (not used)
            
        Returns:
            Message object with essential information
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
            
            if 'payload' in message:
                payload = message['payload']
                
                # Get headers
                if 'headers' in payload:
                    headers = {
                        header['name'].lower(): header['value']
                        for header in payload['headers']
                    }
               
                # Try to get body from parts
                if 'parts' in payload:
                    body = self.get_body_from_parts(payload['parts'])
                # If no parts, try to get body directly
                elif 'body' in payload and 'data' in payload['body']:
                    body = payload['body']['data']
                            
            # Extract essential information
            return {
                'id': message['id'],
                'date': message.get('internalDate'),
                'from': headers.get('from', ''),
                'to': headers.get('to', ''),
                'subject': headers.get('subject', '(No Subject)'),
                'body': body,
                'snippet': message.get('snippet', '')
            }
            
        except HttpError as e:
            logger.error(f"Error getting message {message_id}: {str(e)}")
            raise

    async def get_messages(
        self,
        folders: Optional[List[str]] = None,
        date_range: Optional[DateRange] = None,
        query_terms: Optional[List[str]] = None,
        max_results: int = 100,
        include_attachments: bool = False,
        include_metadata: bool = True,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Get messages from specified folders
        
        Args:
            folders: List of folder/label IDs
            date_range: DateRange object with start and end dates
            query_terms: List of search terms
            max_results: Maximum number of results to return
            include_attachments: Whether to include attachment data (not used)
            include_metadata: Whether to include message metadata (not used)
            db: Database session (used only for authentication)
            
        Returns:
            Dict containing the asset data
        """
        try:
            if not self.service:
                raise ValueError("Service not initialized. Call authenticate first.")
                
            # Build search query
            query_parts = []
            
            if date_range:
                if date_range.start:
                    query_parts.append(f'after:{int(date_range.start.timestamp())}')
                if date_range.end:
                    query_parts.append(f'before:{int(date_range.end.timestamp())}')
                    
            if query_terms:
                query_parts.extend(query_terms)
                
            query = ' '.join(query_parts) if query_parts else None
            
            # Get messages with proper label handling
            results = self.service.users().messages().list(
                userId='me',
                q=query,
                maxResults=max_results,
                labelIds=folders if folders else None
            ).execute()
            
            messages = results.get('messages', [])
            detailed_messages = []
            
            for msg in messages:
                message = await self.get_message(msg['id'])
                detailed_messages.append(message)
                
            # Create asset data
            return {
                'asset_id': f"email_list_{datetime.now().timestamp()}",
                'name': f"Email List - {len(detailed_messages)} messages",
                'description': f"List of {len(detailed_messages)} emails from Gmail",
                'type': AssetType.EMAIL_LIST,
                'content': detailed_messages,
                'status': AssetStatus.READY,
                'metadata': {
                    "createdAt": datetime.now().isoformat(),
                    "updatedAt": datetime.now().isoformat(),
                    "creator": "email_service",
                    "tags": ["email", "gmail"],
                    "agent_associations": [],
                    "version": 1
                }
            }
            
        except HttpError as e:
            logger.error(f"Error getting messages: {str(e)}")
            raise 