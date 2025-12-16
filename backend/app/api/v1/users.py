# backend/app/api/v1/users.py

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.users import User, RoleEnum
from app.schemas.users import UserCreate, UserOut, UserUpdate

router = APIRouter()

# 1. PROFIL : Voir qui je suis
@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# 2. Créer un compte (Réservé au super_admin seul.)
@router.post("/", response_model=UserOut)
def create_user_shell(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Le Directeur crée les 'comptes/profils' (Codes CSPro).
    Ex: Il crée AG001 rattaché au Contrôleur C01.
    """
    # Seul le Directeur crée
    if current_user.role != RoleEnum.directeur:
        raise HTTPException(status_code=403, detail="Seul le Directeur peut créer des comptes.")

    # Vérif code unique
    if user_in.cspro_code:
        if db.query(User).filter(User.cspro_code == user_in.cspro_code).first():
            raise HTTPException(status_code=400, detail="Ce Code CSPro est déjà utilisé.")
            
    # Vérif username unique
    if db.query(User).filter(User.username == user_in.username).first():
        raise HTTPException(status_code=400, detail="Ce nom d'utilisateur existe déjà.")

    # Vérifier que le chef existe vraiment (si un chef est indiqué)
    if user_in.chef_id:
        chef_exist = db.query(User).filter(User.id == user_in.chef_id).first()
        if not chef_exist:
            raise HTTPException(status_code=400, detail=f"Le chef avec l'ID {user_in.chef_id} n'existe pas.")

    new_user = User(
        username=user_in.username,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role,
        cspro_code=user_in.cspro_code,
        chef_id=user_in.chef_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# 3. ASSIGNATION : Activer/Modifier un compte (Hiérarchique)
@router.put("/{user_id}", response_model=UserOut)
def update_user_assignment(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Permet d'assigner un vrai nom et un vrai mot de passe à un code.
    Règle : On ne peut modifier que ses propres subordonnés directs (ou tout le monde si on est Directeur).
    """
    # On cherche l'utilisateur cible
    user_db = db.query(User).filter(User.id == user_id).first()
    if not user_db:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    # érification des droits (cette partie est importante)
    is_directeur = (current_user.role == RoleEnum.directeur)
    is_mon_subordonne = (user_db.chef_id == current_user.id)
    
    if not is_directeur and not is_mon_subordonne:
        raise HTTPException(
            status_code=403, 
            detail="Vous ne pouvez modifier que les agents sous votre responsabilité directe."
        )

    # Mise à jour
    if user_update.username:
        user_db.username = user_update.username
    if user_update.password:
        user_db.password_hash = get_password_hash(user_update.password)

    db.commit()
    db.refresh(user_db)
    return user_db

# 4. SUPPRESSION : Supprimer un utilisateur (Réservé à l'admin seul)
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Supprime définitivement un agent (Démission, Vol, Erreur).
    """
    if current_user.role != RoleEnum.directeur:
        raise HTTPException(status_code=403, detail="Seul le Directeur peut supprimer un utilisateur.")

    user_db = db.query(User).filter(User.id == user_id).first()
    if not user_db:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    # Protection : On ne peut pas supprimer un utilisateur qui a des subordonnés
    # (Sinon on casse la hiérarchie). Il faut d'abord supprimer/bouger les subordonnés.
    if user_db.subordonnes:
        raise HTTPException(
            status_code=400, 
            detail="Impossible de supprimer : cet utilisateur est chef d'équipe. Réassignez son équipe d'abord."
        )

    db.delete(user_db)
    db.commit()
    return None # 204 No Content