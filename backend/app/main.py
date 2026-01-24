# backend/app/main.py

from fastapi import FastAPI
<<<<<<< Updated upstream
from app.api.v1 import auth
from app.api.v1 import auth, users, maps, settings, variables, quotas
=======
from fastapi.middleware.cors import CORSMiddleware # <--- L'IMPORT CRUCIAL
>>>>>>> Stashed changes

# Nettoyage des imports (tu avais des doublons)
from app.api.v1 import auth, users, maps, settings, dictionary

app = FastAPI(
    title="Open Survey Monitor API",
    description="Backend pour le suivi d'enquêtes terrain CSPro",
    version="1.0.0"
)

# En production, on mettra l'URL réelle du site au lieu de "*"
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Autorise GET, POST, PUT, DELETE, etc.
    allow_headers=["*"], # Autorise les tokens d'auth
)
# 

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