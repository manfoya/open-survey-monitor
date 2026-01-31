# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, users, maps, settings, variables, quotas, dictionary, stats, messages, surveys

app = FastAPI(
    title="Open Survey Monitor API",
    description="Backend pour le suivi d'enquêtes terrain CSPro",
    version="1.0.0",
)

# configuration cors
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# inclusion des routeurs
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentification"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Utilisateurs"])
app.include_router(maps.router, prefix="/api/v1/maps", tags=["Maps & Quotas"])
app.include_router(settings.router, prefix="/api/v1/settings", tags=["Global Settings"])
app.include_router(variables.router, prefix="/api/v1/variables", tags=["Variables"]) 
app.include_router(quotas.router, prefix="/api/v1/quotas", tags=["Quotas"]) 
app.include_router(dictionary.router, prefix="/api/v1/dictionary", tags=["Dictionnaire"])
app.include_router(stats.router, prefix="/api/v1/stats", tags=["Statistiques"])
app.include_router(messages.router, prefix="/api/v1/messages", tags=["Messagerie"])
app.include_router(surveys.router, prefix="/api/v1/surveys", tags=["Enquêtes"])

@app.get("/")
def read_root():
    return {"message": "bienvenue sur l'api open survey monitor"}