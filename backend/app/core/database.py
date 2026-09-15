import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

# Charger les variables du fichier .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

# Correctif automatique : Force le protocole postgresql+asyncpg://
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)

if not DATABASE_URL:
    raise ValueError("❌ ERREUR CRITIQUE: DATABASE_URL est introuvable dans le fichier .env")

# Moteur SQLAlchemy Asynchrone compatible Supabase + Windows
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    connect_args={
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
    }
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db():
    """Injecteur de session de base de données pour les routes FastAPI."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()