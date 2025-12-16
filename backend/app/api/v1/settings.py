# backend/app/api/v1/settings.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.users import User, RoleEnum
from app.models.settings import GlobalSettings
from app.schemas.settings import SettingsUpdate, SettingsOut

router = APIRouter()

@router.get("/", response_model=SettingsOut)
def read_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupère la configuration globale.
    Si elle n'existe pas encore, on l'initialise.
    """
    settings = db.query(GlobalSettings).first()
    if not settings:
        # Initialisation automatique
        settings = GlobalSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings

@router.put("/", response_model=SettingsOut)
def update_settings(
    settings_in: SettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Modifier les critères de validité (Admin seulement).
    """
    if current_user.role != RoleEnum.directeur:
        raise HTTPException(status_code=403, detail="Seul le Directeur peut modifier les paramètres globaux.")

    settings = db.query(GlobalSettings).first()
    if not settings:
        settings = GlobalSettings()
        db.add(settings)

    # Mise à jour champ par champ
    settings_data = settings_in.model_dump(exclude_unset=True)
    if 'jours_interdits' in settings_data:
        # On transforme la liste ["Samedi", "Dimanche"] en texte "Samedi,Dimanche"
        valeur_liste = settings_data['jours_interdits']
        if isinstance(valeur_liste, list):
            settings_data['jours_interdits'] = ",".join(valeur_liste)
    for key, value in settings_data.items():
        setattr(settings, key, value)

    db.commit()
    db.refresh(settings)
    return settings
