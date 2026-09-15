from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.models import Customer
from pydantic import BaseModel

router = APIRouter()

# Schemas Pydantic
class CustomerBase(BaseModel):
    code: str
    company_name: str
    ice: str | None = None
    if_number: str | None = None
    address: str | None = None
    city: str | None = None  # Fix : Accepte les valeurs vides (NULL)
    phone: str | None = None
    email: str | None = None
    contact_person: str | None = None

class CustomerCreate(CustomerBase):
    pass

class CustomerOut(CustomerBase):
    id: str

    class Config:
        from_attributes = True

@router.get("/", response_model=List[CustomerOut])
async def get_customers(db: AsyncSession = Depends(get_db)) -> Any:
    """Récupère la liste de tous les clients."""
    result = await db.execute(select(Customer))
    return result.scalars().all()

@router.post("/", response_model=CustomerOut, status_code=status.HTTP_201_CREATED)
async def create_customer(
    customer_in: CustomerCreate,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Création d'un nouveau client."""
    customer = Customer(**customer_in.model_dump())
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    return customer