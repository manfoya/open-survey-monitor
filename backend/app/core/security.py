# backend/app/core/security.py

from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional
from jose import jwt
from passlib.context import CryptContext
import os

# Puisqu'on ne chiffre pas un mot de passe ( ça serait reversible ), on le hash
# et avec Bcrypt on ajoute un peu d'aléatoire pour que deux mots de passe identiques 
# "admin123" n'aient jamais le même hash en base.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Si la variable d'environnement n'existe pas, le code plante ou utilise une clé faible.
# En production, il est important que SECRET_KEY soit chargé depuis le .env.
# On va juste mettre ceci par defaut au cas où le .env manque
SECRET_KEY = os.getenv("SECRET_KEY", "une_cle_par_defaut_si_env_n_existe_pas")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Compare un mot de passe brut (saisi par l'utilisateur) avec le hash stocké.
    Passlib s'occupe de la complexité (extraire l'aléat, re-hacher, comparer).
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Génère le hash sécurisé à stocker en base de données.
    Exemple de sortie : $2b$12$EixZaYVK1...
    """
    return pwd_context.hash(password)

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Génère le jeton JWT (JSON Web Token).
    C'est le "badge d'accès" temporaire que le Frontend enverra à chaque requête.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # "sub" (Subject) est un champ standard JWT pour dire "à qui appartient ce token"
    to_encode = {"exp": expire, "sub": str(subject)}
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
