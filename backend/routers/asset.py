from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from services.asset_service import AssetService
from schemas.asset import AssetType, Asset
from services import auth_service
from models import User

router = APIRouter(prefix="/api/assets", tags=["assets"])

@router.post("/", response_model=Asset)
async def create_asset(
    name: str,
    type: AssetType,
    description: Optional[str] = None,
    subtype: Optional[str] = None,
    content: Optional[dict] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.validate_token)
):
    """Create a new asset"""
    asset_service = AssetService(db)
    return asset_service.create_asset(
        user_id=current_user.user_id,
        name=name,
        type=type,
        description=description,
        subtype=subtype,
        content=content
    )

@router.get("/{asset_id}", response_model=Asset)
async def get_asset(
    asset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.validate_token)
):
    """Get an asset by ID"""
    asset_service = AssetService(db)
    asset = asset_service.get_asset(asset_id, current_user.user_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.get("/", response_model=List[Asset])
async def get_user_assets(
    type: Optional[AssetType] = None,
    subtype: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.validate_token)
):
    """Get all assets for the current user"""
    asset_service = AssetService(db)
    return asset_service.get_user_assets(
        user_id=current_user.user_id,
        type=type,
        subtype=subtype
    )

@router.put("/{asset_id}", response_model=Asset)
async def update_asset(
    asset_id: str,
    updates: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.validate_token)
):
    """Update an asset"""
    asset_service = AssetService(db)
    asset = asset_service.update_asset(asset_id, current_user.user_id, updates)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.delete("/{asset_id}")
async def delete_asset(
    asset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.validate_token)
):
    """Delete an asset"""
    asset_service = AssetService(db)
    success = asset_service.delete_asset(asset_id, current_user.user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Asset not found")
    return {"message": "Asset deleted successfully"} 