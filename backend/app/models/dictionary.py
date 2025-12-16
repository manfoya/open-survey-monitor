# backend/app/models/dictionary.py

from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class VariableType(str, enum.Enum):
    """
    Les types de questions possibles dans CSPro
    """
    choix_unique = "SelectOne"   # Radio button (ex: Sexe)
    choix_multiple = "SelectMany" # Checkbox (ex: Sources de revenus)
    entier = "Integer"           # Nombre (ex: Age)
    texte = "Text"               # Champ libre (ex: Nom)

class Variable(Base):
    """
    Dictionnaire des variables de l'enquête.
    Exemple : ID=1, Nom="Q01_SEXE", Libellé="Sexe du Chef de ménage"
    """
    __tablename__ = "variables"

    id = Column(Integer, primary_key=True, index=True)
    
    # Le "Name" dans CSPro (C'est la clé de liaison !)
    name = Column(String, unique=True, index=True, nullable=False) 
    
    # Le libellé affiché à l'écran pour l'Admin
    label = Column(String, nullable=False)
    
    # Le type de question (utile pour savoir si on affiche un camembert ou une moyenne)
    type = Column(Enum(VariableType), default=VariableType.choix_unique)
    
    # Est-ce une variable utilisable pour les Quotas ?
    # (Ex: Sexe=Oui, Age=Oui, mais "Commentaire"=Non)
    est_quota = Column(Boolean, default=False)

    # Relations
    modalites = relationship("Modalite", back_populates="variable", cascade="all, delete-orphan")


class Modalite(Base):
    """
    Les options de réponses possibles pour les questions à choix (Single/Multiple).
    Exemple : Variable="Q01_SEXE", Code="1", Label="Masculin"
    """
    __tablename__ = "modalites"

    id = Column(Integer, primary_key=True, index=True)
    
    variable_id = Column(Integer, ForeignKey("variables.id"), nullable=False)
    
    # Le code envoyé par CSPro (Attention, c'est souvent du String "01", "A"...)
    code = Column(String, nullable=False)
    
    # Ce qu'on affiche à l'écran
    label = Column(String, nullable=False)

    # Relation
    variable = relationship("Variable", back_populates="modalites")
