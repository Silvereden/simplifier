import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, Enum, ForeignKey
from app.core.database import Base


# --- ENUMS ---
class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    LOGISTICS = "LOGISTICS"
    READONLY = "READONLY"


class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    PARTIALLY_DELIVERED = "PARTIALLY_DELIVERED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class DeliveryStatus(str, enum.Enum):
    PREPARING = "PREPARING"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


# --- MODELS ---
class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.LOGISTICS, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Customer(Base):
    __tablename__ = "customers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String, unique=True, index=True, nullable=False)
    company_name = Column(String, nullable=False)
    ice = Column(String, nullable=True)
    if_number = Column(String, nullable=True)
    address = Column(String, nullable=True)
    city = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    contact_person = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sku = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    unit_weight_kg = Column(Float, nullable=False)
    unit_price_ht = Column(Float, nullable=False)
    vat_rate = Column(Float, default=20.0)
    is_active = Column(Boolean, default=True)


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    po_number = Column(String, unique=True, index=True, nullable=False)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    total_amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class DeliveryNote(Base):
    __tablename__ = "delivery_notes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    bl_number = Column(String, unique=True, index=True, nullable=False)
    order_id = Column(String, ForeignKey("purchase_orders.id"), nullable=True)
    driver_name = Column(String, nullable=True)
    status = Column(Enum(DeliveryStatus), default=DeliveryStatus.PREPARING, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)