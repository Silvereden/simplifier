from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.models import DeliveryNote, PurchaseOrder

router = APIRouter()

@router.get("/", status_code=status.HTTP_200_OK)
async def get_delivery_notes(db: AsyncSession = Depends(get_db)):
    """Récupère la liste de tous les Bons de Livraison (BL) générés"""
    result = await db.execute(
        select(DeliveryNote).options(
            selectinload(DeliveryNote.order).selectinload(PurchaseOrder.customer)
        )
    )
    return result.scalars().all()