# backend/app/models/users.py

from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

# L'Enum force la base de données à n'accepter que ces valeurs précises.
# C'est une sécurité anti-bug : impossible d'insérer "super_admin" ou "Directeur" (avec majuscule) par erreur.
class RoleEnum(str, enum.Enum):
    directeur = "directeur"
    superviseur = "superviseur"
    controleur = "controleur"
    agent = "agent"

class User(Base):
    """
    Représente tous les acteurs du système.
    La hiérarchie est gérée par le champ 'chef_id' (Adjacency List Pattern).
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    
    # On met une valeur par défaut, mais 'nullable=False' est crucial pour la cohérence.
    role = Column(Enum(RoleEnum), default=RoleEnum.agent, nullable=False)
    
    # Code CSPro : C'est le lien crucial avec les données du terrain.
    # Nullable car le Directeur et les superviseurs n'ont pas de tablette pour enquêter.
    cspro_code = Column(String, unique=True, nullable=True, index=True)

    # gestion des hiérachies (Self-Referential)
    # Le concept ici est Auto-jointure.
    # Un utilisateur pointe vers un autre utilisateur de la même table.
    # Exemple : L'Agent A (id=5) a pour chef le Contrôleur B (chef_id=2).
    chef_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # 'remote_side' est nécessaire pour dire à SQLAlchemy que c'est une boucle sur la même table.
    subordonnes = relationship("User", backref="chef", remote_side=[id])
    
    # RELATIONS
    # On utilise "Affectation" en string pour éviter les erreurs d'import circulaire (Circular Import).
    affectations = relationship("Affectation", back_populates="controleur")
