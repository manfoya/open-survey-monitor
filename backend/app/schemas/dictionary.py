# backend/app/schemas/dictionary.py

from pydantic import BaseModel
from typing import List, Optional
from app.models.dictionary import VariableType

# MODALITÉS

class ModaliteBase(BaseModel):
    code: str   # Ex: "1"
    label: str  # Ex: "Masculin"

class ModaliteCreate(ModaliteBase):
    pass

class ModaliteOut(ModaliteBase):
    id: int
    variable_id: int
    class Config:
        from_attributes = True

# VARIABLES

class VariableBase(BaseModel):
    name: str    # Ex: "Q01_SEXE"
    label: str   # Ex: "Sexe du chef de ménage"
    type: VariableType = VariableType.choix_unique
    est_quota: bool = False

class VariableCreate(VariableBase):
    # L'astuce ici : on permet de créer les modalités directement avec la variable
    modalites: List[ModaliteCreate] = []

class VariableOut(VariableBase):
    id: int
    # On renvoie aussi la liste des modalités quand on lit la variable
    modalites: List[ModaliteOut] = []
    
    class Config:
        from_attributes = True
