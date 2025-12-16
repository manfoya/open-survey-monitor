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

## Cette fonction permet de récupérer toute la descendance (enfants + petits-enfants...)
def get_all_subordinates_recursive(user: User) -> List[User]:
    subordinates = []
    # user.subordonnes fonctionne grâce à la correction dans models.py
    # (
    for child in user.subordonnes: 
        subordinates.append(child)
        # On appelle la fonction sur l'enfant (Récursivité)
        subordinates.extend(get_all_subordinates_recursive(child))
    return subordinates
## 

# 1. Voir qui je suis
@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

## Route pour voir mes enfants (ma team)
@router.get("/", response_model=List[UserOut])
def read_my_team(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retourne la liste des utilisateurs visibles.
    - Directeur : voit tout le monde.
    - Autres : Voient uniquement leurs subordonnés (directs et indirects).
    """
    if current_user.role == RoleEnum.directeur:
        # Le boss voit tout la base
        return db.query(User).all()
    
    # Pour les autres, on lance la recherche dans leur descendance
    my_team = get_all_subordinates_recursive(current_user)
    return my_team
##

## Route pour chercher par code
@router.get("/code/{cspro_code}", response_model=UserOut)
def read_user_by_code(
    cspro_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cherche un utilisateur par son code (ex: AG005).
    Sécurité : Je ne peux voir le résultat que si c'est quelqu'un de mon équipe.
    """
    # 1. On cherche si le code existe
    target_user = db.query(User).filter(User.cspro_code == cspro_code).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable avec ce code.")

    # 2. Si je suis Directeur, c'est feu vert & Open Bar
    if current_user.role == RoleEnum.directeur:
        return target_user

    # 3. Si je suis le chef, je vérifie si c'est un de mes descendants
    # On récupère les IDs de toute mon équipe grâce à la fonction récursive
    my_team_ids = [u.id for u in get_all_subordinates_recursive(current_user)]
    
    # On ajoute mon propre ID (si je veux me chercher moi-même)
    my_team_ids.append(current_user.id)

    if target_user.id not in my_team_ids:
        raise HTTPException(
            status_code=403, 
            detail="Accès refusé : Cet agent ne fait pas partie de votre équipe."
        )

    return target_user
##
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

   
    # Vérification de la hiérachie
    if user_in.chef_id:
        chef = db.query(User).filter(User.id == user_in.chef_id).first()
        
        # 1. Est-ce que le chef existe ?
        if not chef:
            raise HTTPException(status_code=400, detail=f"Le chef avec l'ID {user_in.chef_id} n'existe pas.")
        
        # 2.Un agent doit être sous un contôleur
        if user_in.role == RoleEnum.agent and chef.role != RoleEnum.controleur:
            raise HTTPException(
                status_code=400, 
                detail="Hiérarchie invalide : Un Agent doit obligatoirement être sous les ordres d'un Contrôleur."
            )

        # 3. Un Contrôleur doit être sous un Superviseur
        if user_in.role == RoleEnum.controleur and chef.role != RoleEnum.superviseur:
            raise HTTPException(
                status_code=400, 
                detail="Hiérarchie invalide : Un Contrôleur doit obligatoirement être sous les ordres d'un Superviseur."
            )

        # 4. Un Superviseur doit être sous le Directeur
        if user_in.role == RoleEnum.superviseur and chef.role != RoleEnum.directeur:
            raise HTTPException(
                status_code=400, 
                detail="Hiérarchie invalide : Un Superviseur doit être sous les ordres directs du Directeur."
            )
    
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

    # Vérification des droits (cette partie est importante)
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
