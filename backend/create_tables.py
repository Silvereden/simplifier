import asyncio
import sys
import os

# Résolution absolue du dossier racine backend
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from dotenv import load_dotenv
load_dotenv(os.path.join(CURRENT_DIR, ".env"))

from app.core.database import engine, Base

# Importation explicite des modèles pour enregistrer le schéma dans Base.metadata
try:
    import app.models.models  # noqa: F401
except ImportError as e:
    print(f"⚠️ Avertissement lors de l'import des modèles : {e}")

async def init_tables():
    print("⏳ Connexion à la base de données Supabase...")
    try:
        async with engine.begin() as conn:
            print("🛠️ Création des tables en cours...")
            await conn.run_sync(Base.metadata.create_all)
        print("✅ SUCCÈS : Toutes les tables ont été créées sur Supabase !")
    except Exception as e:
        print(f"❌ ERREUR lors de la création des tables : {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_tables())