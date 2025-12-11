# backend/app/schemas/token.py

from pydantic import BaseModel
from typing import Optional

# Indispensable pour la route /login
# Le serveur renverra : {"access_token": "eyJhbGci...", "token_type": "bearer"}
class Token(BaseModel):
    access_token: str
    token_type: str

# Sert à lire les données décryptées à l'intérieur du Token
class TokenData(BaseModel):
    username: Optional[str] = None
