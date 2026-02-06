# backend/app/v1/surveys.py

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.users import User, RoleEnum
from app.models.survey import SurveyData, SurveyStatus
from app.schemas.survey import SurveyOut
from app.api.v1.pagination import (
    PaginatedResponse, 
    PaginationParams, 
    create_pagination_params, 
    paginate_sqlalchemy_query
)

# Fonction helper hiérarchie (même que stats.py, idéalement à factoriser)
def get_team_ids_recursive(user: User) -> List[int]:
    """Récupère les ID de tous les descendants (enfants + petits-enfants...)"""
    ids = [user.id] 
    for child in user.subordonnes:
        ids.extend(get_team_ids_recursive(child))
    return ids

router = APIRouter()

@router.get("/map", response_model=List[dict])
def read_surveys_map(
    scope: str = "team",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupérer tous les points d'enquête pour la carte.
    Retourne uniquement le strict nécessaire (id, lat, long, is_valid).
    """
    query = db.query(SurveyData.id, SurveyData.latitude, SurveyData.longitude, SurveyData.is_valid)
    
    # Même logique de visibilité que la liste
    if scope == "me":
        query = query.filter(SurveyData.user_id == current_user.id)
    elif current_user.role == RoleEnum.directeur:
        pass
    elif current_user.role == RoleEnum.agent:
        query = query.filter(SurveyData.user_id == current_user.id)
    else:
        team_ids = get_team_ids_recursive(current_user)
        query = query.filter(SurveyData.user_id.in_(team_ids))
        
    results = query.all()
    
    # Conversion en liste de dictionnaires pour coller au format attendu
    return [
        {"id": r.id, "latitude": r.latitude, "longitude": r.longitude, "is_valid": r.is_valid} 
        for r in results if r.latitude is not None and r.longitude is not None
    ]

@router.get("/", response_model=PaginatedResponse[SurveyOut])
def read_surveys(
    status: Optional[SurveyStatus] = None,
    is_valid: Optional[bool] = None,
    scope: str = "team",
    pagination: PaginationParams = Depends(create_pagination_params),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lister les enquêtes (Liste brute pour data-grid).
    
    Filtres :
    - status: 'complet', 'partiel', 'refus'
    - is_valid: true/false (QC validé ou non)
    - scope: 'team' (défaut) ou 'me'
    
    Règles de visibilité :
    - Directeur : Tout
    - Superviseur/Contrôleur : Équipe
    - Agent : Soi-même
    """
    
    query = db.query(SurveyData)
    
    # 1. Filtres standards
    if status:
        query = query.filter(SurveyData.status == status)
    if is_valid is not None:
        query = query.filter(SurveyData.is_valid == is_valid)
        
    # 2. Visibilité Hiérarchique
    if scope == "me":
        query = query.filter(SurveyData.user_id == current_user.id)
    elif current_user.role == RoleEnum.directeur:
        pass
    elif current_user.role == RoleEnum.agent:
        query = query.filter(SurveyData.user_id == current_user.id)
    else:
        # Cadres intermédiaires
        team_ids = get_team_ids_recursive(current_user)
        query = query.filter(SurveyData.user_id.in_(team_ids))

    # 3. Pagination & Tri
    paginated = paginate_sqlalchemy_query(
        query,
        pagination,
        allowed_sort_fields=["date_entretien", "date_synchro", "id", "duree_minutes", "status", "is_valid"],
        search_fields=["questionnaire_uuid", "agent_code"]
    )
    
    # 4. Enrichissement (Agent Name)
    # 4. Enrichissement (Agent Name) & Masquage QC
    # On modifie les items retournés pour :
    # a) Injecter le nom "propre"
    # b) Masquer les détails QC pour les rôles non autorisés (Agent, Contrôleur)
    
    vip_roles = [RoleEnum.directeur, RoleEnum.superviseur]
    can_see_qc = current_user.role in vip_roles
    
    for survey in paginated.items:
        # a) Nom de l'agent
        if survey.user:
            survey.agent_name = survey.user.username
        else:
            survey.agent_name = f"Inconnu ({survey.agent_code})"
        
        # b) Masquage QC
        if not can_see_qc:
            survey.qc_results = None
            
    return paginated
