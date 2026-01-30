# backend/app/schemas/survey.py

from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from app.models.survey import SurveyStatus, GenderEnum

class SurveyBase(BaseModel):
    questionnaire_uuid: str
    agent_code: Optional[str] = None
    status: SurveyStatus = SurveyStatus.partiel
    respondent_sex: GenderEnum = GenderEnum.Inconnu
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    duree_minutes: Optional[int] = None
    date_entretien: Optional[datetime] = None
    
    # QC
    is_valid: bool = False
    qc_results: Optional[Dict[str, Any]] = None

class SurveyOut(SurveyBase):
    id: int
    date_synchro: Optional[datetime] = None
    
    # Enrichissement avec le nom de l'agent (récupéré via relation user)
    agent_name: Optional[str] = None 
    
    # Contenu (optionnel si on veut la liste légère)
    answers: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True
