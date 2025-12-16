# backend/app/main.py

from fastapi import FastAPI
from app.api.v1 import auth
from app.models import users, zones, survey, settings
from app.api.v1 import auth, users


app = FastAPI(
    title="Open Survey Monitor API",
    description="Backend pour le suivi d'enquêtes terrain CSPro",
    version="1.0.0"
)

# On inclut nos routes
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentification"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Utilisateurs"])  


@app.get("/")
def read_root():
    return {"message": "Bienvenue sur l'API Open Survey Monitor"}
