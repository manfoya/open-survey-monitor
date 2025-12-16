from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.users import User, RoleEnum
from app.models.zones import Zone, Affectation
from app.schemas.maps import ZoneCreate, ZoneOut, AffectationCreate, AffectationOut, AffectationUpdate

router = APIRouter()

# Gestion des zones
@router.post("/zones/", response_model=ZoneOut)
def create_zone(
    zone_in: ZoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Créer une nouvelle zone géographique (Admin seulement)."""
    if current_user.role != RoleEnum.directeur:
        raise HTTPException(status_code=403, detail="Seul le Directeur peut créer des zones.")
    
    zone = Zone(**zone_in.model_dump())
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone

@router.get("/zones/", response_model=List[ZoneOut])
def read_zones(
    skip: int = 0, limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lister toutes les zones."""
    return db.query(Zone).offset(skip).limit(limit).all()

# Gestion des affectations (missions et quotas)

@router.post("/affectations/", response_model=AffectationOut)
def create_affectation(
    aff_in: AffectationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Le Directeur affecte un Contrôleur à une Zone avec des Quotas (simples ou croisés).
    """
    if current_user.role != RoleEnum.directeur:
        raise HTTPException(status_code=403, detail="Réservé au Directeur.")

    # 1. Vérifier que le contrôleur existe et a le bon rôle
    controleur = db.query(User).filter(User.id == aff_in.controleur_id).first()
    if not controleur or controleur.role != RoleEnum.controleur:
        raise HTTPException(status_code=400, detail="L'utilisateur affecté doit être un Contrôleur.")

    # 2. Vérifier que la zone existe
    zone = db.query(Zone).filter(Zone.id == aff_in.zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone introuvable.")

    # 3. Création (Pydantic gère la validation du json quota grâce au schéma QuotaConfig)
    # Note: on utilise model_dump() pour convertir le Pydantic model en dict compatible json
    aff_data = aff_in.model_dump()
    
    # Petite astuce : SQLAlchemy attend un Dict pour le champ json, pas un objet Pydantic
    if aff_in.objectifs_quota:
        aff_data['objectifs_quota'] = aff_in.objectifs_quota.model_dump()

    affectation = Affectation(**aff_data)
    db.add(affectation)
    db.commit()
    db.refresh(affectation)

    # On force le remplissage des noms pour l'affichage immédiat
    # SQLAlchemy va chercher les infos grâce aux relations
    affectation.nom_zone = affectation.zone.nom_zone
    affectation.nom_controleur = affectation.controleur.username
    
    return affectation

@router.get("/affectations/", response_model=List[AffectationOut])
def read_affectations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Voir les missions en cours.
    - Directeur : Tout voir.
    - Contrôleur : Voir ses propres missions.
    """
    if current_user.role == RoleEnum.directeur:
        query = db.query(Affectation).all()
    else:
        # Si je suis contrôleur, je ne vois que mes zones
        query = db.query(Affectation).filter(Affectation.controleur_id == current_user.id).all()

    # On enrichit la réponse avec les noms (pour l'affichage frontend)
    results = []
    for aff in query:
        # On injecte les noms manuellement car AffectationOut les attend
        aff.nom_zone = aff.zone.nom_zone
        aff.nom_controleur = aff.controleur.username
        results.append(aff)
        
    return results

@router.put("/affectations/{id}", response_model=AffectationOut)
def update_affectation(
    id: int,
    aff_update: AffectationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Modifier les quotas ou fermer la mission."""
    if current_user.role != RoleEnum.directeur:
        raise HTTPException(status_code=403, detail="Réservé au Directeur.")
        
    aff = db.query(Affectation).filter(Affectation.id == id).first()
    if not aff:
        raise HTTPException(status_code=404, detail="Affectation introuvable")

    if aff_update.est_actif is not None:
        aff.est_actif = aff_update.est_actif
    if aff_update.date_fin:
        aff.date_fin = aff_update.date_fin
    
    # Mise à jour des quotas JSON
    if aff_update.objectifs_quota:
        aff.objectifs_quota = aff_update.objectifs_quota.model_dump()

    db.commit()
    db.refresh(aff)
    return aff
