# backend/app/models/quotas.py

from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserQuota(Base):
    """
    Représente l'assignation d'un quota à un utilisateur avec son effectif individuel.
    Exemple : L'agent Jean doit atteindre 50 "Femmes 18-25 ans à Dakar" sur les 200 total
    """
    __tablename__ = "user_quotas"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    quota_id = Column(Integer, ForeignKey('quotas.id'), nullable=False)
    
    # Effectif cible pour cet utilisateur spécifique
    effectif_cible = Column(Integer, nullable=False, default=0)
    
    # Effectif actuellement atteint par cet utilisateur
    effectif_actuel = Column(Integer, nullable=False, default=0)
    
    # L'assignation est-elle encore active ?
    is_active = Column(Boolean, default=True)
    
    # Relations
    user = relationship("User", back_populates="user_quotas")
    quota = relationship("Quota", back_populates="user_quotas")
    
    @property
    def taux_completion(self) -> float:
        """Calcule le taux de completion individuel en pourcentage"""
        if self.effectif_cible == 0:
            return 0.0
        return min((self.effectif_actuel / self.effectif_cible) * 100, 100.0)
    
    @property
    def is_complete(self) -> bool:
        """Vérifie si l'utilisateur a atteint son quota individuel"""
        return self.effectif_actuel >= self.effectif_cible

class Quota(Base):
    """
    Représente un quota d'enquête avec ses critères.
    Exemple : "Femmes 18-25 ans à Dakar" - template réutilisable pour plusieurs agents
    """
    __tablename__ = "quotas"

    id = Column(Integer, primary_key=True, index=True)
    
    # Description lisible du quota
    description = Column(String, nullable=False)
    
    # Le quota est-il encore actif ?
    is_active = Column(Boolean, default=True)

    # Relations - SQLAlchemy crée automatiquement la table d'association
    criterias = relationship(
        "Criteria", 
        secondary="quota_criteria",  # Nom de la table que SQLAlchemy va créer
        back_populates="quotas"
    )
    
    # Relation avec les assignations utilisateur
    user_quotas = relationship("UserQuota", back_populates="quota")
    
    @property
    def effectif_cible_total(self) -> int:
        """Calcule l'effectif cible total (somme de tous les utilisateurs)"""
        return sum(uq.effectif_cible for uq in self.user_quotas if uq.is_active)
    
    @property
    def effectif_actuel_total(self) -> int:
        """Calcule l'effectif actuellement atteint (somme de tous les utilisateurs)"""
        return sum(uq.effectif_actuel for uq in self.user_quotas if uq.is_active)
    
    @property
    def taux_completion_global(self) -> float:
        """Calcule le taux de completion global du quota"""
        total_cible = self.effectif_cible_total
        if total_cible == 0:
            return 0.0
        return min((self.effectif_actuel_total / total_cible) * 100, 100.0)


class Criteria(Base):
    """
    Représente un critère de quota (ex: Sexe=Féminin, Age=18-25)
    Chaque critère est lié à une variable et une modalité du dictionnaire
    """
    __tablename__ = "criterias"

    id = Column(Integer, primary_key=True, index=True)
    
    # Lien vers la variable du dictionnaire (ex: "Q01_SEXE")
    variable_id = Column(Integer, ForeignKey("variables.id"), nullable=False)
    
    # Lien vers la modalité spécifique (ex: "1" pour Masculin)
    modalite_id = Column(Integer, ForeignKey("modalites.id"), nullable=False)
    
    # Description optionnelle du critère (ex: "Femmes 18-25 ans")
    description = Column(String, nullable=True)

    # Relations
    variable = relationship("Variable")
    modalite = relationship("Modalite")
    
    # SQLAlchemy crée automatiquement la table d'association
    quotas = relationship(
        "Quota", 
        secondary="quota_criteria",  # Même nom que dans Quota
        back_populates="criterias"
    )

    def __str__(self):
        return f"{self.variable.label}: {self.modalite.label}"