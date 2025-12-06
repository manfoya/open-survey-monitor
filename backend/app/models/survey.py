# backend/app/models/survey.py

from sqlalchemy import Column, Integer, String, Float, DateTime, Enum
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
    DONNÉES DU TERRAIN OBTENU APRÈS QUE L'AGENT AIT SYNCHRONISÉ
    Cette table est remplie automatiquement par le script ETL.
    On évite de la modifier manuellement pour ne pas dire de ne pas la modifier.
    """
    __tablename__ = "survey_data"

    id = Column(Integer, primary_key=True, index=True)
    
    # IMPORTANT : UUID venant de CSPro. 
    # C'est ce qui empêche d'avoir des doublons si on relance le script de synchro 10 fois.
    # Comment ça marche ? : Les questionnaires ont un identifiant unique, on vérifie à chaque 
    # fois si cet UUID unique est déjà présent dans la base de données, si non, on peut.
    questionnaire_uuid = Column(String, unique=True, index=True, nullable=False)
    
    # On stocke le code textuel (ex: "AG045") pour un couplage "lâche" avec la table User.
    # Ce qu'on essaie d'éviter c'est de ne pas faire planter le script si un agent synchronise
    # ses données avant que son compte utilisateur ne soit créer sur le Dashboard.
    # Alors on garde agent_code en String au lieu de ForeignKey vers User
    agent_code = Column(String, index=True) 
    
    # Métadonnées extraites
    status = Column(Enum(SurveyStatus), default=SurveyStatus.partiel)
    respondent_sex = Column(Enum(GenderEnum), default=GenderEnum.Inconnu)
    
    # Géolocalisation réelle (Où l'enquête a vraiment eu lieu)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Horodatage
    date_entretien = Column(DateTime, nullable=True) # Date déclarée dans la tablette
    date_synchro = Column(DateTime, nullable=True)   # Date où le serveur a reçu la donnée
    
    # Contrôle Qualité
    duree_minutes = Column(Integer, nullable=True)
