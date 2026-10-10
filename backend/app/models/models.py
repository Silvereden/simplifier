import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


# --- ÉNUMÉRATIONS ---

class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    FULFILLED = "FULFILLED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class DeliveryStatus(str, enum.Enum):
    PREPARING = "PREPARING"
    EN_COURS = "EN_COURS"
    LIVRE = "LIVRE"


# --- MODÈLE UTILISATEUR (AUTH) ---

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="operator")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# --- MODÈLE CLIENT ---

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String, nullable=False, default=lambda: f"CUST-{str(uuid.uuid4())[:6].upper()}")
    company_name = Column(String, nullable=False)
    email = Column(String, nullable=True, default="")
    address = Column(String, nullable=False, default="Zone Industrielle")
    city = Column(String, nullable=False, default="Tétouan")
    ice = Column(String, nullable=False, default="000000000000000")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relation vers les bons de commande
    orders = relationship("PurchaseOrder", back_populates="customer", cascade="all, delete-orphan")


# --- MODÈLE BON DE COMMANDE (PO) ---

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String, ForeignKey("customers.id"), nullable=True)
    po_number = Column(String, nullable=False, unique=True)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    total_amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    customer = relationship("Customer", back_populates="orders")
    delivery_note = relationship("DeliveryNote", back_populates="order", uselist=False)


# --- MODÈLE BON DE LIVRAISON (BL) ---

class DeliveryNote(Base):
    __tablename__ = "delivery_notes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String, ForeignKey("purchase_orders.id"), nullable=False)
    bl_number = Column(String, nullable=False, unique=True)
    driver_name = Column(String, nullable=True, default="Chauffeur Glacematic")
    status = Column(Enum(DeliveryStatus), default=DeliveryStatus.PREPARING)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relation vers la commande
    order = relationship("PurchaseOrder", back_populates="delivery_note")