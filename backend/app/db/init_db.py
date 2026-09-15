import asyncio
from app.core.database import engine, Base, AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.models import User, UserRole, Customer, Product

async def init_db():
    async with engine.begin() as conn:
        # Création des tables dans PostgreSQL
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # 1. Création de l'administrateur par défaut
        admin_email = "admin@glacematic.ma"
        result = await session.execute(
            Base.metadata.tables["users"].select().where(Base.metadata.tables["users"].c.email == admin_email)
        )
        if not result.scalar():
            admin_user = User(
                email=admin_email,
                password_hash=get_password_hash("AdminGlacematic2026!"),
                full_name="Responsable Glacematic",
                role=UserRole.ADMIN,
                is_active=True
            )
            session.add(admin_user)

        # 2. Création de clients exemple
        client_code = "CLI-0001"
        res_cli = await session.execute(
            Base.metadata.tables["customers"].select().where(Base.metadata.tables["customers"].c.code == client_code)
        )
        if not res_cli.scalar():
            marjane = Customer(
                code=client_code,
                company_name="LABEL'VIE MARTIL",
                ice="001524893000045",
                if_number="40125896",
                address="Avenue Mohamed V, Martil",
                city="Martil",
                phone="0539970000",
                email="achats@labelvie.ma",
                contact_person="M. Responsable Achats"
            )
            session.add(marjane)

            marjane_riad = Customer(
                code="CLI-0002",
                company_name="Marjane Hay Riad",
                ice="001524893000088",
                if_number="40125899",
                address="Avenue Annakhil, Hay Riad",
                city="Rabat",
                phone="0537710000",
                email="reception.riad@marjane.ma",
                contact_person="Responsable Réception"
            )
            session.add(marjane_riad)

        # 3. Création des produits fondamentaux
        products_data = [
            {"sku": "ICE-1KG", "name": "Sac de glace 1 kg", "unit_weight_kg": 1.0, "unit_price_ht": 10.00},
            {"sku": "ICE-2KG", "name": "Sac de glace 2 kg", "unit_weight_kg": 2.0, "unit_price_ht": 18.00},
            {"sku": "ICE-5KG", "name": "Sac de glace 5 kg", "unit_weight_kg": 5.0, "unit_price_ht": 40.00},
        ]

        for p_data in products_data:
            res_p = await session.execute(
                Base.metadata.tables["products"].select().where(Base.metadata.tables["products"].c.sku == p_data["sku"])
            )
            if not res_p.scalar():
                product = Product(
                    sku=p_data["sku"],
                    name=p_data["name"],
                    unit_weight_kg=p_data["unit_weight_kg"],
                    unit_price_ht=p_data["unit_price_ht"],
                    vat_rate=20.00,
                    is_active=True
                )
                session.add(product)

        await session.commit()
        print("Base de données Glacematic initialisée avec succès avec les données de démonstration !")

if __name__ == "__main__":
    asyncio.run(init_db())