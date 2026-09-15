from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importation des routeurs d'API v1
from app.api.v1.endpoints import auth, customers, orders, deliveries

app = FastAPI(
    title="Glacematic Management App",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/api/v1/openapi.json"
)

# Configuration CORS pour autoriser la communication avec le Frontend (React/Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enregistrement des routeurs d'endpoints
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(customers.router, prefix="/api/v1/customers", tags=["Customers"])
app.include_router(orders.router, prefix="/api/v1/orders", tags=["Orders & BL"])
app.include_router(deliveries.router, prefix="/api/v1/deliveries", tags=["Deliveries"])

# Endpoint de vérification de statut
@app.get("/")
def read_root():
    return {
        "status": "online",
        "app_name": "Glacematic Management App",
        "version": "1.0.0",
        "documentation": "/docs"
    }

# Endpoint d'état de santé du serveur (Healthcheck)
@app.get("/health")
def health_check():
    return {"status": "healthy"}