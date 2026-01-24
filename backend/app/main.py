# backend/app/main.py

from fastapi import FastAPI
from app.api.v1 import auth
from app.api.v1 import auth, users, maps, settings, variables, quotas


app = FastAPI(
    title="Open Survey Monitor API",
    description="Backend pour le suivi d'enquêtes terrain CSPro",
    version="1.0.0"
)

# On inclut nos routes
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentification"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Utilisateurs"])
app.include_router(maps.router, prefix="/api/v1/maps", tags=["Maps & Quotas"])
app.include_router(settings.router, prefix="/api/v1/settings", tags=["Global Settings"])
app.include_router(variables.router, prefix="/api/v1/variables", tags=["Variables"]) 
app.include_router(quotas.router, prefix="/api/v1/quotas", tags=["Quotas"]) 


@app.get("/")
def read_root():
    return {"message": "Bienvenue sur l'API Open Survey Monitor"}
