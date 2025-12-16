# backend/app/schemas/settings.py

from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import time

class SettingsBase(BaseModel):
    check_gps: bool = True
    tolerance_gps_metres: int = 500

    check_duree: bool = True
    min_duree_minutes: int = 10

    check_heure: bool = False
    heure_debut_travail: Optional[time] = None
    heure_fin_travail: Optional[time] = None

    check_jours: bool = False
    jours_interdits: List[str] = [] # Ex: ["Dimanche"]

    check_vitesse: bool = True
    max_enquetes_par_jour: int = 20

    message_du_jour: Optional[str] = None

class SettingsUpdate(SettingsBase):
    pass

class SettingsOut(SettingsBase):
    id: int
    @field_validator('jours_interdits', mode='before')
    @classmethod
    def parse_jours_interdits(cls, v):
        # Si la base renvoie une chaîne (ex: "Samedi,Dimanche")
        if isinstance(v, str):
            if not v: # Si vide
                return []
            return v.split(',') # On coupe à la virgule
        return v
    class Config:
        from_attributes = True
