# backend/app/api/v1/stats.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_current_user, get_db
from app.models.users import User, RoleEnum
from app.models.survey import SurveyData, SurveyStatus
from app.models.quotas import UserQuota
from app.schemas.stats import DashboardStats, QuotaProgressItem

# On importe ta fonction magique récursive (depuis users.py ou en la copiant ici)
# Pour éviter les imports circulaires, je la remets ici proprement.
def get_team_ids_recursive(user: User) -> List[int]:
    """Récupère les ID de tous les descendants (enfants + petits-enfants...)"""
    ids = [user.id] # On s'inclut soi-même
    for child in user.subordonnes:
        ids.extend(get_team_ids_recursive(child))
    return ids

router = APIRouter()

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    scope: str = "team",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Dashboard Intelligent :
    - Agent : Voit ses stats perso.
    - Contrôleur : Voit les stats de SES subordonnés (pas toute la zone, juste son équipe), sans détails d'erreurs.
    - Superviseur : Voit SES subordonnés (Contrôleurs + leurs Agents), AVEC détails.
    - Directeur : Voit TOUT.
    
    Paramètre scope:
    - "team" (défaut) : comportement hiérarchique normal
    - "me" : force la vue sur l'utilisateur connecté uniquement
    """
    
    # 1. Initialisation des requêtes
    query_surveys = db.query(SurveyData)
    query_quotas = db.query(UserQuota).filter(UserQuota.is_active == True)

    # 2. DÉFINITION DU PÉRIMÈTRE (Qui voit qui ?)
    
    # Si scope="me", on force le filtre sur l'utilisateur courant, peu importe son rôle
    if scope == "me":
        query_surveys = query_surveys.filter(SurveyData.user_id == current_user.id)
        query_quotas = query_quotas.filter(UserQuota.user_id == current_user.id)
        
    elif current_user.role == RoleEnum.directeur:
        # Le Directeur voit tout, pas de filtre
        pass
        
    elif current_user.role == RoleEnum.agent:
        # L'agent ne voit que lui-même (scope "team" n'a pas de sens pour lui, c'est comme "me")
        query_surveys = query_surveys.filter(SurveyData.user_id == current_user.id)
        query_quotas = query_quotas.filter(UserQuota.user_id == current_user.id)
        
    else:
        # Pour Superviseur et Contrôleur (scope="team") : On récupère leur descendance hiérarchique
        team_ids = get_team_ids_recursive(current_user)
        
        # On filtre sur cette liste d'IDs
        query_surveys = query_surveys.filter(SurveyData.user_id.in_(team_ids))
        query_quotas = query_quotas.filter(UserQuota.user_id.in_(team_ids))


    # --- EXÉCUTION DES REQUÊTES ---
    all_surveys = query_surveys.all()
    user_quotas = query_quotas.all()

    # 3. CALCULS DES COMPTEURS
    total_recus = len(all_surveys)
    count_complet = sum(1 for s in all_surveys if s.status == SurveyStatus.complet)
    count_partiel = sum(1 for s in all_surveys if s.status == SurveyStatus.partiel)
    count_refus = sum(1 for s in all_surveys if s.status == SurveyStatus.refus)
    
    count_valide = sum(1 for s in all_surveys if s.is_valid)
    count_suspect = total_recus - count_valide

    # 4. CALCULS DES QUOTAS (Aggrégés pour l'équipe)
    quota_map = {}
    
    for uq in user_quotas:
        if uq.quota_id not in quota_map:
            quota_map[uq.quota_id] = {
                "quota": uq.quota,
                "cible": 0,
                "fait": 0,
                "is_complete": True 
            }
        
        quota_map[uq.quota_id]["cible"] += uq.effectif_cible
        quota_map[uq.quota_id]["fait"] += uq.effectif_actuel
        if not uq.is_complete:
            quota_map[uq.quota_id]["is_complete"] = False
            
    # Transformation en liste
    quota_items = []
    for q_id, data in quota_map.items():
        pct = 0.0
        if data["cible"] > 0:
            pct = (data["fait"] / data["cible"]) * 100
            if pct > 100: pct = 100.0
            
        item = QuotaProgressItem(
            id=q_id,
            nom=data["quota"].description,
            cible=data["cible"],
            fait=data["fait"],
            pourcentage=round(pct, 1),
            est_atteint=data["is_complete"]
        )
        quota_items.append(item)

    # 5. DÉTAILS DES ERREURS (Masquage sélectif)
    error_stats = None
    
    # Seuls Directeur et Superviseur voient le "Pourquoi"
    # Le Contrôleur (qui est dans le 'else' ci-dessus) n'est PAS dans cette liste VIP
    vip_roles = [RoleEnum.directeur, RoleEnum.superviseur]
    
    if current_user.role in vip_roles:
        error_stats = {}
        for s in all_surveys:
            if not s.is_valid and s.qc_results:
                for type_err, details in s.qc_results.items():
                    if isinstance(details, dict) and details.get("status") == "FAIL":
                        error_stats[type_err] = error_stats.get(type_err, 0) + 1

    return DashboardStats(
        total_reçus=total_recus,
        total_complet=count_complet,
        total_partiel=count_partiel,
        total_refus=count_refus,
        total_valide=count_valide,
        total_suspect=count_suspect, 
        progression_quotas=quota_items,
        repartition_erreurs=error_stats # Sera null pour le Contrôleur
    )