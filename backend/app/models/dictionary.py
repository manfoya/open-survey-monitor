# backend/app/models/dictionary.py

from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, JSON, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class VariableDataType(str, enum.Enum):
    """
    Type de donnée technique (utilisé pour le casting côté Backend)
    """
    NUMBER = "number"   # Entiers ou décimaux (Age, Revenu)
    TEXT = "text"       # Champ libre (Nom, Commentaire)
    DATE = "date"       # Date (Date de naissance)
    BOOLEAN = "boolean" # Vrai/Faux (Est en zone rurale ?)
    LIST = "list"       # Choix unique ou multiple (Sexe, Région)
    TIME = "time"       # Heure (Heure de début)

class Variable(Base):
    """
    Source de vérité pour le Query Builder.
    Définit quelles variables sont disponibles et comment les afficher.
    """
    __tablename__ = "variables"

    id = Column(Integer, primary_key=True, index=True)
    
    # L'identifiant technique unique (ex: "age", "q01_sexe")
    # C'est ce champ qui sera utilisé dans le JSON du Query Builder ("field": "age")
    slug = Column(String, unique=True, index=True, nullable=False)
    
    # Le label humain (ex: "Âge du répondant")
    label = Column(String, nullable=False)
    
    # Le type de donnée pour le moteur de règles
    data_type = Column(String, nullable=False, default=VariableDataType.TEXT)
    
    # Configuration JSON pour l'interface Frontend (Flexibilité totale)
    # Exemples :
    # Pour Age : { "inputType": "number", "min": 18, "max": 99, "step": 1 }
    # Pour Date : { "inputType": "date", "format": "YYYY-MM-DD" }
    ui_config = Column(JSON, nullable=True, default=dict)

    # Liste des opérateurs exclus (optionnel)
    # Ex: Pour une ville, on ne veut pas "plus grand que".
    # Stocké en JSON : ["<", ">", "<=", ">="]
    excluded_operators = Column(JSON, nullable=True, default=list)

    # Est-ce une variable utilisable pour les Quotas ?
    is_quota = Column(Boolean, default=False, index=True)

    # Relations
    # Uniquement pertinent si data_type == 'list'
    modalites = relationship("Modalite", back_populates="variable", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Variable {self.slug} ({self.data_type})>"


class Modalite(Base):
    """
    Les options prédéfinies pour les variables de type LIST.
    Sert à alimenter les dropdowns du Query Builder.
    """
    __tablename__ = "modalites"

    id = Column(Integer, primary_key=True, index=True)
    
    variable_id = Column(Integer, ForeignKey("variables.id"), nullable=False)
    
    # La valeur technique stockée (ex: "1", "M", "DAK")
    value = Column(String, nullable=False)
    
    # Le label affiché dans le dropdown (ex: "Masculin", "Dakar")
    label = Column(String, nullable=False)
    
    # Ordre d'affichage optionnel
    order = Column(Integer, default=0)

    # Relation
    variable = relationship("Variable", back_populates="modalites")
    
    def __repr__(self):
        return f"<Modalite {self.label}={self.value}>"