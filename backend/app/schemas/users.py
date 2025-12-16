# backend/app/schemas/users.py

from pydantic import BaseModel
from typing import Optional
from app.models.users import RoleEnum

# SCHEMAS UTILISATEURS (DTO - Data Transfer Objects)

# 1. Schéma de base (Les champs communs)
# Pour éviter de réécrire 'username' et 'role' partout, on va utiliser une classe
# UserCreate et UserOut héritent de cette base.
class UserBase(BaseModel):
    username: str
    role: RoleEnum = RoleEnum.agent
    cspro_code: Optional[str] = None

# 2. Schéma pour la CRÉATION
# C'est ce que l'API attend quand on veut créer un utilisateur.
# Autrement, ce qu'on envoie pour créer un compte
class UserCreate(UserBase):
    password: str
    chef_id: Optional[int] = None

# 3. Schéma pour le LOGIN
# Ce qu'on envoie pour se connecter
class UserLogin(BaseModel):
    username: str
    password: str

# 4. Schéma pour la lecture ( ce que l'API renvoie au frontend)
# Pour ne pas renvoyer de mot de passe, on utilise 
# UserOut comme "response_model" dans FastAPI, le champ 'password'
# (qui est dans UserCreate) sera automatiquement exclu.
class UserOut(UserBase):
    id: int
    chef_id: Optional[int] = None

    class Config:
        # Permet à Pydantic de lire les objets SQLAlchemy
        # 'orm_mode = True' dans Pydantic V1
        from_attributes = True


class UserUpdate(BaseModel):
    """
    Utilisé quand un chef assigne un nom réel à un code.
    Tous les champs sont optionnels car on ne modifie que ce qui est nécessaire.
    """
    username: Optional[str] = None # Pour mettre le vrai nom (ex: "Kouadio")
    password: Optional[str] = None # Pour définir le mot de passe personnel
    chef_id: Optional[int] = None  # pour permettre de changer de chef après
