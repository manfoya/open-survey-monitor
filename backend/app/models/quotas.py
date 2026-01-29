# backend/app/models/quotas.py

from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserQuota(Base):
    """
    Assignation d'un quota à un utilisateur.
    """
    __tablename__ = "user_quotas"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    quota_id = Column(Integer, ForeignKey('quotas.id'), nullable=False)
    
    effectif_cible = Column(Integer, nullable=False, default=0)
    effectif_actuel = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, default=True)
    
    user = relationship("User", back_populates="user_quotas")
    quota = relationship("Quota", back_populates="user_quotas")
    
    @property
    def taux_completion(self) -> float:
        if self.effectif_cible == 0:
            return 0.0
        return min((self.effectif_actuel / self.effectif_cible) * 100, 100.0)
    
    @property
    def is_complete(self) -> bool:
        return self.effectif_actuel >= self.effectif_cible

class Quota(Base):
    """
    La logique complexe est stockée dans 'definition' (JSON).
    """
    __tablename__ = "quotas"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    # --- LE COEUR DU SYSTÈME ---
    # Stocke l'arbre JSON (ex: { "condition": "AND", "rules": [...] })
    # Sur PostgreSQL, SQLAlchemy utilise JSONB automatiquement pour ce type
    definition = Column(JSON, nullable=False, default=dict)

    # Relations
    user_quotas = relationship("UserQuota", back_populates="quota")
    
    # Propriétés calculées (inchangées)
    @property
    def effectif_cible_total(self) -> int:
        return sum(uq.effectif_cible for uq in self.user_quotas if uq.is_active)
    
    @property
    def effectif_actuel_total(self) -> int:
        return sum(uq.effectif_actuel for uq in self.user_quotas if uq.is_active)
    
    @property
    def taux_completion_global(self) -> float:
        total_cible = self.effectif_cible_total
        if total_cible == 0:
            return 0.0
        return min((self.effectif_actuel_total / total_cible) * 100, 100.0)

# NOTE : La classe 'Criteria' a été supprimée.