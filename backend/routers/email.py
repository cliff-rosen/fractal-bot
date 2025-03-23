from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from services.auth_service import validate_token
from services.email_service import EmailService
from schemas.email import (
    EmailLabel,
    EmailMessage,
    EmailSearchParams,
    EmailAgentResponse
)
from database import get_db
import logging
from fastapi.responses import RedirectResponse
from config.settings import settings
from google.auth.transport.flow import Flow
from google.oauth2.credentials import GoogleOAuth2Credentials

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/email", tags=["email"])
email_service = EmailService()

@router.get("/auth/init")
async def init_oauth2(
    user = Depends(validate_token),
    db: Session = Depends(get_db)
):
    """
    Initialize the OAuth2 flow for Google Mail API
    
    Args:
        user: Authenticated user
        db: Database session
        
    Returns:
        RedirectResponse to Google OAuth2 consent screen
    """
    try:
        # Create OAuth2 flow
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
                    "scopes": email_service.SCOPES
                }
            },
            scopes=email_service.SCOPES
        )
        
        # Generate authorization URL
        auth_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
        
        # Store state in session or database for verification
        # For now, we'll use the user_id as part of the state
        state = f"{state}_{user.user_id}"
        
        return RedirectResponse(auth_url)
        
    except Exception as e:
        logger.error(f"Error initializing OAuth2 flow: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error initializing OAuth2 flow: {str(e)}"
        )

@router.get("/auth/callback")
async def oauth2_callback(
    code: str,
    state: str,
    db: Session = Depends(get_db)
):
    """
    Handle the OAuth2 callback from Google
    
    Args:
        code: Authorization code from Google
        state: State parameter for verification
        db: Database session
        
    Returns:
        RedirectResponse to frontend success page
    """
    try:
        # Extract user_id from state
        user_id = int(state.split('_')[1])
        
        # Create OAuth2 flow
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
                    "scopes": email_service.SCOPES
                }
            },
            scopes=email_service.SCOPES
        )
        
        # Exchange code for tokens
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        # Store credentials in database
        db_credentials = GoogleOAuth2Credentials(
            user_id=user_id,
            token=credentials.token,
            refresh_token=credentials.refresh_token,
            token_uri=credentials.token_uri,
            client_id=credentials.client_id,
            client_secret=credentials.client_secret,
            scopes=credentials.scopes,
            expiry=credentials.expiry
        )
        
        # Update or insert credentials
        existing_credentials = db.query(GoogleOAuth2Credentials).filter(
            GoogleOAuth2Credentials.user_id == user_id
        ).first()
        
        if existing_credentials:
            for key, value in db_credentials.__dict__.items():
                if key != '_sa_instance_state':
                    setattr(existing_credentials, key, value)
        else:
            db.add(db_credentials)
            
        db.commit()
        
        # Redirect to frontend success page
        return RedirectResponse(f"{settings.FRONTEND_URL}/email/auth/success")
        
    except Exception as e:
        logger.error(f"Error handling OAuth2 callback: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error handling OAuth2 callback: {str(e)}"
        )

@router.get("/labels", response_model=EmailAgentResponse)
async def list_labels(
    include_system_labels: bool = True,
    user = Depends(validate_token),
    db: Session = Depends(get_db)
):
    """
    List all email labels/folders
    
    Args:
        include_system_labels: Whether to include system labels like INBOX, SENT, etc.
        user: Authenticated user
        db: Database session
        
    Returns:
        EmailAgentResponse with list of labels
    """
    try:
        # Authenticate with Gmail API
        if not await email_service.authenticate(user.user_id, db):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to authenticate with Gmail API"
            )
            
        # Get labels
        response = await email_service.list_labels(include_system_labels)
        if not response.success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=response.error
            )
            
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing labels: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing labels: {str(e)}"
        )

@router.post("/messages", response_model=EmailAgentResponse)
async def get_messages(
    params: EmailSearchParams,
    user = Depends(validate_token),
    db: Session = Depends(get_db)
):
    """
    Get messages matching the search parameters
    
    Args:
        params: Search parameters for finding messages
        user: Authenticated user
        db: Database session
        
    Returns:
        EmailAgentResponse with list of messages
    """
    try:
        # Authenticate with Gmail API
        if not await email_service.authenticate(user.user_id, db):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to authenticate with Gmail API"
            )
            
        # Get messages
        response = await email_service.get_messages(params)
        if not response.success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=response.error
            )
            
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting messages: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting messages: {str(e)}"
        )

@router.get("/messages/{message_id}", response_model=EmailAgentResponse)
async def get_message(
    message_id: str,
    include_attachments: bool = False,
    user = Depends(validate_token),
    db: Session = Depends(get_db)
):
    """
    Get a specific message by ID
    
    Args:
        message_id: ID of the message to retrieve
        include_attachments: Whether to include attachment data
        user: Authenticated user
        db: Database session
        
    Returns:
        EmailAgentResponse with message details
    """
    try:
        # Authenticate with Gmail API
        if not await email_service.authenticate(user.user_id, db):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to authenticate with Gmail API"
            )
            
        # Get message
        response = await email_service.get_message(message_id, include_attachments)
        if not response.success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=response.error
            )
            
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting message: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting message: {str(e)}"
        ) 