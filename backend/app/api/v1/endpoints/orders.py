from datetime import datetime
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.models import (
    Customer,
    DeliveryNote,
    DeliveryStatus,
    OrderStatus,
    PurchaseOrder,
)

router = APIRouter()

# --- Schémas ---

class OrderItemSchema(BaseModel):
    product_name: str
    quantity: int
    unit_price: float

class OrderCreateSchema(BaseModel):
    customer_id: str
    po_number: str
    items: List[OrderItemSchema]

class EmailOrderItemSchema(BaseModel):
    product_name: str
    quantity: int
    unit_price: float = 0.0

class OrderFromEmailSchema(BaseModel):
    client_name: str
    client_email: Optional[str] = None
    items: List[EmailOrderItemSchema]
    notes: Optional[str] = None


# --- Routes ---

@router.get("/", status_code=status.HTTP_200_OK)
async def get_purchase_orders(db: AsyncSession = Depends(get_db)):
    """0. Récupérer la liste des Bons de Commande (PO) pour le tableau de bord"""
    result = await db.execute(
        select(PurchaseOrder).options(selectinload(PurchaseOrder.customer))
    )
    return result.scalars().all()


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_purchase_order(
    order_in: OrderCreateSchema, 
    db: AsyncSession = Depends(get_db)
):
    """1. Enregistrer un nouveau Bon de Commande (PO) manuel"""
    total = sum(item.quantity * item.unit_price for item in order_in.items)
    
    po = PurchaseOrder(
        customer_id=order_in.customer_id,
        po_number=order_in.po_number,
        status=OrderStatus.PENDING,
        total_amount=total
    )
    db.add(po)
    await db.commit()
    await db.refresh(po)
    return {"message": "Bon de commande créé avec succès", "order_id": po.id}


@router.post("/from-email", status_code=status.HTTP_201_CREATED)
async def create_purchase_order_from_email(
    payload: OrderFromEmailSchema,
    db: AsyncSession = Depends(get_db)
):
    """2. Réceptionner et enregistrer un PO automatiquement (Make / Webhook / Mailhook)"""
    
    # A. Recherche du client par email ou par nom
    customer = None
    if payload.client_email:
        result = await db.execute(select(Customer).filter(Customer.email == payload.client_email))
        customer = result.scalars().first()
    
    if not customer and payload.client_name:
        result = await db.execute(
            select(Customer).filter(Customer.company_name.ilike(f"%{payload.client_name}%"))
        )
        customer = result.scalars().first()
        
    # B. Auto-création du client s'il est inconnu dans la base
    if not customer:
        customer = Customer(
            company_name=payload.client_name or "Client Inconnu",
            email=payload.client_email
        )
        db.add(customer)
        await db.commit()
        await db.refresh(customer)

    # C. Génération automatique du numéro de PO
    raw_prefix = getattr(customer, "code", None) or customer.company_name[:3]
    prefix = "".join(e for e in raw_prefix if e.isalnum()).upper()
    timestamp = datetime.now().strftime("%Y%m%d-%H%M")
    po_number = f"PO-{prefix}-{timestamp}"

    # D. Calcul du montant total
    total_amount = sum(item.quantity * item.unit_price for item in payload.items)

    # E. Enregistrement en base de données avec statut PENDING
    po = PurchaseOrder(
        customer_id=customer.id,
        po_number=po_number,
        status=OrderStatus.PENDING,
        total_amount=total_amount
    )
    
    db.add(po)
    await db.commit()
    await db.refresh(po)

    return {
        "message": "Bon de commande créé avec succès !",
        "order_id": po.id,
        "po_number": po.po_number,
        "customer": customer.company_name,
        "total_amount": po.total_amount,
        "status": po.status
    }


@router.post("/{order_id}/convert-to-bl", status_code=status.HTTP_201_CREATED)
async def convert_po_to_bl(
    order_id: str, 
    driver_name: str | None = "Chauffeur Glacematic",
    db: AsyncSession = Depends(get_db)
):
    """3. Transformer un Bon de Commande (PO) en Bon de Livraison (BL)"""
    result = await db.execute(select(PurchaseOrder).filter(PurchaseOrder.id == order_id))
    po = result.scalars().first()
    
    if not po:
        raise HTTPException(status_code=404, detail="Bon de commande introuvable")

    bl_number = f"BL-{po.po_number}-{datetime.now().strftime('%d%m%Y')}"

    bl = DeliveryNote(
        order_id=po.id,
        bl_number=bl_number,
        driver_name=driver_name,
        status=DeliveryStatus.PREPARING
    )
    
    po.status = OrderStatus.CONFIRMED

    db.add(bl)
    await db.commit()
    await db.refresh(bl)

    return {
        "message": "Bon de livraison généré avec succès !",
        "bl_id": bl.id,
        "bl_number": bl.bl_number
    }