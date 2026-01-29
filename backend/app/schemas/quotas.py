# backend/app/schemas/quotas.py

from pydantic import BaseModel, Field
from typing import List, Union, Literal, Any, Optional

# --- 1. Structure du Query Builder (JSON) ---

class Rule(BaseModel):
    field: str       # Slug de la variable (ex: "age")
    operator: str    # "=", ">", "null", etc.
    # IMPORTANT : Optional car les opérateurs "null"/"notNull" n'ont pas de value
    value: Optional[Any] = None 

class RuleGroup(BaseModel):
    combinator: Literal["and", "or"]
    # Récursivité : Une règle peut être un autre groupe ou une règle simple
    rules: List[Union["RuleGroup", Rule]] 

# --- 2. Schemas pour les Assignations (UserQuota) ---
# (Ceux-ci manquaient pour gérer l'affichage côté "Mon Équipe")

class UserQuotaBase(BaseModel):
    user_id: int
    effectif_cible: int
    is_active: bool = True

class UserQuotaCreate(UserQuotaBase):
    pass

class UserQuotaBulkAssign(BaseModel):
    quota_id: int
    user_ids: List[int]
    effectif_cible: int
    is_active: bool = True

class UserQuotaUpdate(BaseModel):
    # Tout est optionnel pour permettre la modif partielle
    effectif_cible: Optional[int] = None
    effectif_actuel: Optional[int] = None
    is_active: Optional[bool] = None

class UserQuotaResponse(UserQuotaBase):
    id: int
    quota_id: int
    effectif_actuel: int
    taux_completion: float
    is_complete: bool

    class Config:
        from_attributes = True

# --- 3. Schemas pour les Quotas (Définition) ---

class QuotaBase(BaseModel):
    description: str
    is_active: bool = True
    definition: RuleGroup # L'arbre JSON validé

class QuotaCreate(QuotaBase):
    pass

class QuotaUpdate(BaseModel):
    # IMPORTANT : On ne veut pas forcer l'utilisateur à renvoyer tout le JSON
    # s'il change juste le titre.
    description: Optional[str] = None
    is_active: Optional[bool] = None
    definition: Optional[RuleGroup] = None

class QuotaResponse(QuotaBase):
    id: int
    # Propriétés calculées (agrégats)
    effectif_cible_total: int
    effectif_actuel_total: int
    taux_completion_global: float
    
    # On inclut souvent la liste des assignations pour le détail admin
    user_quotas: List[UserQuotaResponse] = []

    class Config:
        from_attributes = True