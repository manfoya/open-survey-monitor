from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.users import User, RoleEnum
from app.models.quotas import Quota, UserQuota
from app.schemas.quotas import (
    QuotaCreate, QuotaUpdate, QuotaResponse,
    UserQuotaCreate, UserQuotaUpdate, UserQuotaResponse
)
# On importe le moteur logique
from app.services.quota_engine import QuotaEngine

router = APIRouter()

# ==============================================================================
# 1. GESTION DES DÉFINITIONS DE QUOTAS (ADMINISTRATION)
# ==============================================================================

@router.post("/", response_model=QuotaResponse)
def create_quota(
    quota_in: QuotaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    [Directeur] Créer un nouveau modèle de quota (ex: "Femmes 18-25 à Dakar").
    """
    if current_user.role != RoleEnum.directeur:
        raise HTTPException(status_code=403, detail="Accès réservé au Directeur")

    # Conversion du modèle Pydantic (RuleGroup) en dictionnaire pour le JSONB
    definition_dict = quota_in.definition.model_dump()

    new_quota = Quota(
        description=quota_in.description,
        is_active=quota_in.is_active,
        definition=definition_dict 
    )
    db.add(new_quota)
    db.commit()
    db.refresh(new_quota)
    return new_quota

@router.get("/", response_model=List[QuotaResponse])
def read_quotas(
    skip: int = 0, 
    limit: int = 100, 
    active_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    [Tous] Lister les quotas disponibles.
    """
    query = db.query(Quota)
    if active_only:
        query = query.filter(Quota.is_active == True)
    return query.offset(skip).limit(limit).all()

@router.get("/{quota_id}", response_model=QuotaResponse)
def read_quota_detail(
    quota_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    [Tous] Détail d'un quota spécifique.
    """
    quota = db.query(Quota).filter(Quota.id == quota_id).first()
    if not quota:
        raise HTTPException(status_code=404, detail="Quota introuvable")
    return quota

@router.patch("/{quota_id}", response_model=QuotaResponse)
def update_quota(
    quota_id: int,
    quota_in: QuotaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    [Directeur] Mettre à jour un quota (Désactiver, changer les règles...).
    """
    if current_user.role != RoleEnum.directeur:
        raise HTTPException(status_code=403, detail="Accès réservé au Directeur")

    quota = db.query(Quota).filter(Quota.id == quota_id).first()
    if not quota:
        raise HTTPException(status_code=404, detail="Quota introuvable")

    # Mise à jour partielle
    update_data = quota_in.model_dump(exclude_unset=True)
    
    # Si on met à jour la définition, on s'assure qu'elle est bien en dict
    if 'definition' in update_data and update_data['definition']:
        # Note: Pydantic a déjà validé la structure
        pass 

    for field, value in update_data.items():
        setattr(quota, field, value)

    db.add(quota)
    db.commit()
    db.refresh(quota)
    return quota

@router.delete("/{quota_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quota(
    quota_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    [Directeur] Supprimer un quota (Attention aux assignations existantes !).
    """
    if current_user.role != RoleEnum.directeur:
        raise HTTPException(status_code=403, detail="Accès réservé au Directeur")

    quota = db.query(Quota).filter(Quota.id == quota_id).first()
    if not quota:
        raise HTTPException(status_code=404, detail="Quota introuvable")
    
    # Optional: Vérifier s'il y a des user_quotas liés et bloquer ?
    # Pour l'instant on laisse le cascade delete (si configuré) ou erreur SQL.
    db.delete(quota)
    db.commit()
    return None

# ==============================================================================
# 2. OUTIL DE TEST (SIMULATEUR)
# ==============================================================================

@router.post("/{quota_id}/check-match")
def check_match(
    quota_id: int,
    user_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    [Outil] Tester si un profil fictif correspond à ce quota.
    Utile pour débugger les règles JSON.
    """
    quota = db.query(Quota).filter(Quota.id == quota_id).first()
    if not quota:
        raise HTTPException(status_code=404, detail="Quota introuvable")

    is_match = QuotaEngine.check(quota.definition, user_data)
    
    return {
        "quota_id": quota.id,
        "description": quota.description,
        "is_match": is_match,
        "input_data": user_data
    }

# ==============================================================================
# 3. GESTION DES ASSIGNATIONS (USER QUOTAS)
# ==============================================================================

@router.post("/assignments", response_model=UserQuotaResponse)
def assign_quota_to_user(
    assignment_in: UserQuotaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    [Superviseur/Directeur] Assigner un quota à un enquêteur avec un objectif.
    Ex: "Jean doit faire 10 enquêtes de ce type."
    """
    if current_user.role not in [RoleEnum.directeur, RoleEnum.superviseur]:
        raise HTTPException(status_code=403, detail="Non autorisé")

    # Vérifier doublon
    existing = db.query(UserQuota).filter(
        UserQuota.user_id == assignment_in.user_id,
        UserQuota.quota_id == assignment_in.quota_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Cet utilisateur a déjà ce quota assigné. Utilisez UPDATE.")

    new_assign = UserQuota(
        user_id=assignment_in.user_id,
        quota_id=assignment_in.quota_id,
        effectif_cible=assignment_in.effectif_cible,
        is_active=assignment_in.is_active
    )
    db.add(new_assign)
    db.commit()
    db.refresh(new_assign)
    return new_assign

@router.get("/assignments/me", response_model=List[UserQuotaResponse])
def read_my_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    [Enqueteur] Voir MES objectifs et ma progression.
    """
    # Retourne les quotas assignés à l'utilisateur connecté
    return db.query(UserQuota).filter(
        UserQuota.user_id == current_user.id,
        UserQuota.is_active == True
    ).all()

@router.patch("/assignments/{assignment_id}", response_model=UserQuotaResponse)
def update_assignment(
    assignment_id: int,
    update_in: UserQuotaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    [Superviseur] Modifier l'objectif d'un utilisateur (ex: augmenter la cible).
    """
    if current_user.role not in [RoleEnum.directeur, RoleEnum.superviseur]:
        raise HTTPException(status_code=403, detail="Non autorisé")

    uq = db.query(UserQuota).filter(UserQuota.id == assignment_id).first()
    if not uq:
        raise HTTPException(status_code=404, detail="Assignation introuvable")

    update_data = update_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(uq, field, value)

    db.add(uq)
    db.commit()
    db.refresh(uq)
    return uq