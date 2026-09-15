import asyncio
import os
import sys
import uuid
import re
import pandas as pd
from datetime import datetime
from sqlalchemy import text

# Résolution des chemins
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from dotenv import load_dotenv
load_dotenv(os.path.join(CURRENT_DIR, ".env"))

from app.core.database import AsyncSessionLocal

EXCEL_FILE = os.path.join(CURRENT_DIR, "LIVRAISONS JOURNALIERES 2026.xls")

MONTH_MAP = {
    'JANVIER': 1, 'FEVRIER': 2, 'MARS': 3, 'AVRIL': 4,
    'MAI': 5, 'JUIN': 6, 'JUILLET': 7, 'AOUT': 8,
    'SEPTEMBRE': 9, 'OCTOBRE': 10, 'NOVEMBRE': 11, 'DECEMBRE': 12
}

def get_default_date_from_sheet(sheet_name):
    parts = sheet_name.strip().upper().split()
    month = 1
    year = 2026
    for p in parts:
        if p in MONTH_MAP:
            month = MONTH_MAP[p]
        elif p.isdigit() and len(p) == 4:
            year = int(p)
    return datetime(year, month, 1)

def clean_quantity(val):
    if pd.isna(val):
        return 0.0
    val_str = str(val).strip().replace('_', '').replace(' ', '').replace(',', '.')
    match = re.search(r'(\d+(\.\d+)?)', val_str)
    if match:
        return float(match.group(1))
    return 0.0

def parse_excel_file(file_path):
    print(f"📖 Ouverture et analyse du fichier Excel : {os.path.basename(file_path)}...")
    xls = pd.ExcelFile(file_path)
    records = []

    for sheet in xls.sheet_names:
        if sheet.startswith('Feuil'):
            continue

        df = pd.read_excel(file_path, sheet_name=sheet, header=None)
        
        header_idx = None
        for r in range(min(10, len(df))):
            row_vals = [str(x).upper().strip() for x in df.iloc[r].values]
            if 'DATE' in row_vals and ('CLIENT' in row_vals or 'N°BL' in row_vals):
                header_idx = r
                break

        if header_idx is None:
            continue

        header_row = [str(x).upper().strip() for x in df.iloc[header_idx].values]
        date_col = next((i for i, v in enumerate(header_row) if 'DATE' in v), None)
        bl_col = next((i for i, v in enumerate(header_row) if 'N°BL' in v or 'N° BL' in v or 'BL' in v), None)
        client_col = next((i for i, v in enumerate(header_row) if 'CLIENT' in v), None)
        totalkg_col = next((i for i, v in enumerate(header_row) if 'TOTAL' in v), None)

        last_valid_date = get_default_date_from_sheet(sheet)

        for r in range(header_idx + 1, len(df)):
            row = df.iloc[r]
            
            client_val = str(row[client_col]).strip() if client_col is not None and pd.notna(row[client_col]) else ""
            bl_val = str(row[bl_col]).strip() if bl_col is not None and pd.notna(row[bl_col]) else ""
            date_val = row[date_col] if date_col is not None else None

            if not client_val or client_val.upper() in ['TOTAL', 'NAN', 'NONE', '0']:
                continue
            if 'TOTAL' in client_val.upper() or 'SEMAINE' in client_val.upper():
                continue

            if pd.notna(date_val) and str(date_val).strip() not in ['"', "''", "-", ""]:
                try:
                    parsed_date = pd.to_datetime(date_val)
                    if pd.notna(parsed_date):
                        last_valid_date = parsed_date.to_pydatetime()
                except Exception:
                    pass

            totalkg_val = clean_quantity(row[totalkg_col]) if totalkg_col is not None else 0.0

            records.append({
                "sheet": sheet,
                "date": last_valid_date,
                "driver_or_bl": bl_val,
                "client_name": client_val,
                "total_kg": totalkg_val
            })

    print(f"✅ {len(records)} lignes de livraisons extraites sur l'ensemble des mois !")
    return records

async def run_import():
    if not os.path.exists(EXCEL_FILE):
        print(f"❌ Fichier introuvable : {EXCEL_FILE}")
        return

    records = parse_excel_file(EXCEL_FILE)
    if not records:
        return

    async with AsyncSessionLocal() as session:
        print("⏳ Connexion à Supabase...")

        # 1. Insertion Produits
        p1_id, p2_id = str(uuid.uuid4()), str(uuid.uuid4())
        await session.execute(text("""
            INSERT INTO products (id, sku, name, unit_weight_kg, unit_price_ht, vat_rate, is_active)
            VALUES 
                (:id1, 'SAC-01KG', 'Sac de Glace 1 KG', 1.0, 5.0, 20.0, TRUE),
                (:id2, 'SAC-02KG', 'Sac de Glace 2 KG', 2.0, 10.0, 20.0, TRUE)
            ON CONFLICT (sku) DO NOTHING;
        """), {"id1": p1_id, "id2": p2_id})

        # 2. Préparation et insertion en masse des Clients
        unique_clients = sorted(list({r["client_name"] for r in records}))
        client_map = {}
        client_batch = []
        
        for idx, client_name in enumerate(unique_clients, 1):
            cust_id = str(uuid.uuid4())
            cust_code = f"CUST-{idx:04d}"
            city = "Casablanca"
            c_lower = client_name.lower()
            if "marrakech" in c_lower:
                city = "Marrakech"
            elif "tanger" in c_lower:
                city = "Tanger"
            elif "rabat" in c_lower or "temara" in c_lower:
                city = "Rabat"

            client_map[client_name] = cust_id
            client_batch.append({
                "id": cust_id,
                "code": cust_code,
                "name": client_name,
                "city": city
            })

        print(f"👥 Insertion instantanée de {len(unique_clients)} clients...")
        await session.execute(text("""
            INSERT INTO customers (id, code, company_name, city, created_at)
            VALUES (:id, :code, :name, :city, CURRENT_TIMESTAMP)
            ON CONFLICT (code) DO NOTHING;
        """), client_batch)
        await session.commit()

        # 3. Préparation des Commandes (PO) et BL
        print("📦 Insertion des 3 453 livraisons par paquets de 500...")
        po_records = []
        bl_records = []

        for idx, rec in enumerate(records, 1):
            order_id = str(uuid.uuid4())
            po_number = f"PO-{rec['date'].strftime('%Y%m')}-{idx:05d}"
            bl_id = str(uuid.uuid4())
            bl_number = f"BL-{rec['date'].strftime('%Y%m')}-{idx:05d}"
            customer_id = client_map.get(rec["client_name"])

            po_records.append({
                "id": order_id,
                "po_num": po_number,
                "cust_id": customer_id,
                "total_kg": rec["total_kg"],
                "dt": rec["date"]
            })

            bl_records.append({
                "id": bl_id,
                "bl_num": bl_number,
                "order_id": order_id,
                "driver": rec["driver_or_bl"] if rec["driver_or_bl"] else "Standard",
                "dt": rec["date"]
            })

        # Exécution par paquets
        CHUNK_SIZE = 500
        for i in range(0, len(po_records), CHUNK_SIZE):
            po_chunk = po_records[i:i + CHUNK_SIZE]
            bl_chunk = bl_records[i:i + CHUNK_SIZE]

            await session.execute(text("""
                INSERT INTO purchase_orders (id, po_number, customer_id, status, total_amount, created_at)
                VALUES (:id, :po_num, :cust_id, 'DELIVERED', :total_kg, :dt);
            """), po_chunk)

            await session.execute(text("""
                INSERT INTO delivery_notes (id, bl_number, order_id, driver_name, status, created_at)
                VALUES (:id, :bl_num, :order_id, :driver, 'DELIVERED', :dt);
            """), bl_chunk)

            await session.commit()
            print(f"   ➡️ {min(i + CHUNK_SIZE, len(po_records))}/{len(po_records)} livraisons insérées...")

        print("🎉 IMPORTATION TERMINÉE AVEC SUCCÈS !")

if __name__ == "__main__":
    asyncio.run(run_import())