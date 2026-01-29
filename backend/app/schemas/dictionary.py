# backend/app/schemas/dictionary.py

from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any
from app.models.dictionary import VariableDataType

# --- Schemas pour les Modalités ---
class ModaliteBase(BaseModel):
    value: str # ex: "1"
    label: str # ex: "Masculin"
    order: Optional[int] = 0

class ModaliteCreate(ModaliteBase):
    pass

class ModaliteOut(ModaliteBase):
    id: int
    class Config:
        from_attributes = True

# --- Schemas pour les Variables ---
class VariableBase(BaseModel):
    slug: str       # ex: "age"
    label: str      # ex: "Âge"
    data_type: VariableDataType # "number", "list", etc.
    is_quota: bool = False
    
    # Champs JSON optionnels
    ui_config: Optional[Dict[str, Any]] = {} 
    excluded_operators: Optional[List[str]] = []

class VariableCreate(VariableBase):
    # Liste des modalités (uniquement si data_type="list")
    modalites: Optional[List[ModaliteCreate]] = []

    @field_validator('slug')
    def slug_must_be_lowercase(cls, v):
        return v.lower().strip().replace(" ", "_")

class VariableUpdate(BaseModel):
    label: Optional[str] = None
    is_quota: Optional[bool] = None
    ui_config: Optional[Dict[str, Any]] = None
    excluded_operators: Optional[List[str]] = None
    modalites: Optional[List[ModaliteCreate]] = None

class VariableOut(VariableBase):
    id: int
    modalites: List[ModaliteOut] = []

    class Config:
        from_attributes = True