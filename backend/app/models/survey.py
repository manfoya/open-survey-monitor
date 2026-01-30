# backend/app/models/survey.py

from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class SurveyStatus(str, enum.Enum):
    complet = "complet" # Enquête terminée validée
    partiel = "partiel" # En cours ou abandonné
    refus = "refus"     # Ménage a refusé

class GenderEnum(str, enum.Enum):
    M = "M" # pour masculin
    F = "F" # naturellement  ceci pour féminin
    Inconnu = "Inconnu" # Il faut être prudent dans la vie, il pourrait avoir les deux mêmes

class SurveyData(Base):
    """
    données du terrain obtenu après que l'agent ait synchronisé
    cette table est remplie automatiquement par le script etl.
    """
    __tablename__ = "survey_data"

    id = Column(Integer, primary_key=True, index=True)
    
    # important : uuid venant de cspro. 
    questionnaire_uuid = Column(String, unique=True, index=True, nullable=False)
    
    # code agent textuel (ex: "ag045") pour couplage lâche
    agent_code = Column(String, index=True)

    # lien technique vers l'utilisateur (si trouvé)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # métadonnées extraites
    status = Column(Enum(SurveyStatus), default=SurveyStatus.partiel)
    respondent_sex = Column(Enum(GenderEnum), default=GenderEnum.Inconnu)
    
    # géolocalisation réelle
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # horodatage
    date_entretien = Column(DateTime, nullable=True) # date déclarée dans la tablette
    date_synchro = Column(DateTime, nullable=True)   # date où le serveur a reçu la donnée
    
    # contrôle qualité
    duree_minutes = Column(Integer, nullable=True)

    # ajouts pour le système de validation
    is_valid = Column(Boolean, default=False) # par défaut invalide tant que pas validé par le QC
    qc_results = Column(JSON, default=dict)
    
    # contenu brut des réponses pour affichage
    answers = Column(JSON, default=dict)

    # relation avec user
    user = relationship("User", back_populates="surveys")