# backend/app/api/v1/auth.py

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

# imports internes
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from app.models.users import User
from app.schemas.token import Token

router = APIRouter()

@router.post("/login", response_model=Token)
def login_for_access_token(
    # OAuth2PasswordRequestForm injecte automatiquement username/password depuis le formulaire.
    # Dans Swagger, cela correspond au cadenas vert "Authorize".
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    """
    Authentifie l'utilisateur et retourne un jeton JWT.
    """
    
    # 1. Recherche de l'utilisateur
    user = db.query(User).filter(User.username == form_data.username).first()
    
    # 2. Vérification (Existence + Mot de passe)
    # On utilise une seule erreur générique pour ne pas aider un attaquant à deviner si le user existe.
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Création du Token
    # Le 'subject' est l'identifiant unique dans le token. Ici on utilise le username.
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.username, expires_delta=access_token_expires
    )
    
    # 4. Réponse
    return {"access_token": access_token, "token_type": "bearer"}
