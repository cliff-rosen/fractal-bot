from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from models import Asset as AssetModel
from schemas.asset import AssetType, AssetStatus, Asset
from datetime import datetime

class AssetService:
    def __init__(self, db: Session):
        self.db = db

    def _model_to_schema(self, model: AssetModel) -> Asset:
        """Convert database model to Pydantic schema"""
        return Asset(
            asset_id=model.asset_id,
            name=model.name,
            description=model.description,
            type=model.type,
            content=model.content,
            metadata={
                "status": AssetStatus.READY,  # Default to READY since we don't store status in DB
                "createdAt": model.created_at.isoformat(),
                "updatedAt": model.updated_at.isoformat(),
                "creator": None,  # We don't store creator in DB
                "tags": [],  # We don't store tags in DB
                "agent_associations": [],  # We don't store agent associations in DB
                "version": 1,  # Default version
                "subtype": model.subtype  # Store subtype in metadata since it's not in schema
            }
        )

    def create_asset(
        self,
        user_id: int,
        name: str,
        type: AssetType,
        description: Optional[str] = None,
        subtype: Optional[str] = None,
        content: Optional[Any] = None
    ) -> Asset:
        """Create a new asset"""
        asset_model = AssetModel(
            user_id=user_id,
            name=name,
            description=description,
            type=type,
            subtype=subtype,
            content=content
        )
        self.db.add(asset_model)
        self.db.commit()
        self.db.refresh(asset_model)
        return self._model_to_schema(asset_model)

    def get_asset(self, asset_id: str, user_id: int) -> Optional[Asset]:
        """Get an asset by ID"""
        asset_model = self.db.query(AssetModel).filter(
            AssetModel.asset_id == asset_id,
            AssetModel.user_id == user_id
        ).first()
        if not asset_model:
            return None
        return self._model_to_schema(asset_model)

    def get_user_assets(
        self,
        user_id: int,
        type: Optional[AssetType] = None,
        subtype: Optional[str] = None
    ) -> List[Asset]:
        """Get all assets for a user, optionally filtered by type and subtype"""
        query = self.db.query(AssetModel).filter(AssetModel.user_id == user_id)
        
        if type:
            query = query.filter(AssetModel.type == type)
        if subtype:
            query = query.filter(AssetModel.subtype == subtype)
            
        return [self._model_to_schema(model) for model in query.all()]

    def update_asset(
        self,
        asset_id: str,
        user_id: int,
        updates: Dict[str, Any]
    ) -> Optional[Asset]:
        """Update an asset"""
        asset_model = self.db.query(AssetModel).filter(
            AssetModel.asset_id == asset_id,
            AssetModel.user_id == user_id
        ).first()
        if not asset_model:
            return None

        # Handle special cases for updates
        if 'content' in updates:
            asset_model.content = updates['content']
        if 'name' in updates:
            asset_model.name = updates['name']
        if 'description' in updates:
            asset_model.description = updates['description']
        if 'type' in updates:
            asset_model.type = updates['type']
        if 'subtype' in updates:
            asset_model.subtype = updates['subtype']

        asset_model.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(asset_model)
        return self._model_to_schema(asset_model)

    def delete_asset(self, asset_id: str, user_id: int) -> bool:
        """Delete an asset"""
        asset_model = self.db.query(AssetModel).filter(
            AssetModel.asset_id == asset_id,
            AssetModel.user_id == user_id
        ).first()
        if not asset_model:
            return False

        self.db.delete(asset_model)
        self.db.commit()
        return True 