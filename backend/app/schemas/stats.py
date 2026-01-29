# backend/app/schemas/stats.py

from pydantic import BaseModel
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
    repartition_erreurs: Optional[Dict[str, int]] = None

    class Config:
        from_attributes = True
