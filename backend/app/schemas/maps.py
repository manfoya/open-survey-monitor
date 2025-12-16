# backend/app/schemas/maps.py

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
from datetime import datetime

# Schéma pour la structure du quota

class QuotaRule(BaseModel):
    """
    Définit une ligne d'objectif.
    Ex: { "conditions": {"SEXE": "F", "ETHNIE": "NOIR"}, "cible": 15 }
    """
    description: Optional[str] = None # Ex: "Femmes Noires" (pour l'affichage)
    conditions: Dict[str, Any] # Le dictionnaire des critères (ex: SEXE: F)
    cible: int # Combien on en veut
    actuel: int = 0 # Compteur temps réel

class QuotaConfig(BaseModel):
    """
    Le json complet stocké en base.
    """
    type: str = "global" # "global" ou "croise"
    cible_globale: Optional[int] = None # Utilisé si type = "global"
    regles: List[QuotaRule] = [] # Utilisé si type = "croise"

# Zones

class ZoneBase(BaseModel):
    nom_zone: str
    latitude_centrale: float
    longitude_centrale: float
    rayon_tolerance_metres: int = 500

class ZoneCreate(ZoneBase):
    pass

class ZoneOut(ZoneBase):
    id: int
    class Config:
        from_attributes = True

# Affectations

class AffectationBase(BaseModel):
    controleur_id: int
    zone_id: int
    date_debut: Optional[datetime] = None
    date_fin: Optional[datetime] = None
    est_actif: bool = True
    
    # On utilise un schéma complexe ici : l'idée, c'est de permettre les 
    # quotas croisés
    objectifs_quota: Optional[QuotaConfig] = None 

class AffectationCreate(AffectationBase):
    pass

class AffectationUpdate(BaseModel):
    """Pour modifier une mission en cours (prolonger date, changer quota)"""
    date_fin: Optional[datetime] = None
    est_actif: Optional[bool] = None
    objectifs_quota: Optional[QuotaConfig] = None

class AffectationOut(AffectationBase):
    id: int
    # On ajoute les noms pour l'affichage facile dans le frontend
    nom_zone: Optional[str] = None
    nom_controleur: Optional[str] = None
    
    class Config:
        from_attributes = True
