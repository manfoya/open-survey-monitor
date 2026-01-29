# backend/app/schemas/stats.py

from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class QuotaProgressItem(BaseModel):
    id: int
    nom: str
    cible: int
    fait: int
    pourcentage: float
    est_atteint: bool

class DashboardStats(BaseModel):
    total_reçus: int
    total_complet: int
    total_partiel: int
    total_refus: int
    total_valide: int
    total_suspect: int
    
    progression_quotas: List[QuotaProgressItem] = []
    
    # Ce champ est NULL pour les agents et contrôleurs (réservé Superviseur/Directeur)
    repartition_erreurs: Optional[Dict[str, int]] = Field(
        None, 
        description="Détail des erreurs (GPS, Durée...). Null si l'utilisateur n'a pas les droits de voir les détails."
    )

    class Config:
        from_attributes = True
