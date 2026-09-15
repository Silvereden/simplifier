from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.models import DeliveryNote

router = APIRouter()

@router.get("/")
async def get_deliveries(db: AsyncSession = Depends(get_db)) -> Any:
    """Récupère la liste de tous les Bons de Livraison (BL)."""
    result = await db.execute(select(DeliveryNote))
    return result.scalars().all()