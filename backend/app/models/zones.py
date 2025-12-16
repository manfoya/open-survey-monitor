# backend/app/models/zones.py

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Zone(Base):
    """
    Les références géographiques, ils sont souvent statique
    Ces données ne changent pas souvent (Villages, Quartiers, ).
    """
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    nom_zone = Column(String, index=True, nullable=False) # Ex: "Quartier Zongo"
    
    # Centroïde de la zone (Le point central de la Zone, c'est avec ça on définit une distance 
    # comme rayon et on a la zone puisque on ne peut vraiment pas définir les coordonnées des 
    # des frontières d'un quartier ou d'un village). On va se baser aussi sur ce point pour 
    # calculer les distances
    latitude_centrale = Column(Float, nullable=False)
    longitude_centrale = Column(Float, nullable=False)

    # Le rayon du cercle
    # Par défaut 500m, mais modifiable si le village est très grand
    rayon_tolerance_metres = Column(Integer, default=500)
    
    # Relation : Une zone peut avoir plusieurs affectations dans le temps
    affectations = relationship("Affectation", back_populates="zone")

class Affectation(Base):
    """
    Table de liaison (Many-to-Many enrichie).
    C'est un peu comme l'ordre de mission "tel contrôleur va dans telle
    zone avec tel objectif".
    """
    __tablename__ = "affectations"

    id = Column(Integer, primary_key=True, index=True)
    
    # Qui ? (Le chef d'équipe/Contrôleur), c'est au Contrôleur qui est le chef d'équipe
    # qu'on affecte une zone géographique
    controleur_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Où ? C'est l'id unique qui permet d'identifier la Zone, la table zone est défini 
    # précédemment
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False)
    
    # Quoi ? (objectif fixé par le directeur)
    # On  suppose que par zone affecté à une équipe, le super_admin que nous appelons
    # directeur ici fixe un quota, on rappelle que la même zone peut être affecté à 
    # plusieurs équipes, donc attention à la manière d'interpréter le quota
    quota_attendu = Column(Integer, default=0)
    
    # Quand ? (Permet d'historiser : Affectation de la semaine 1, semaine 2...)
    # Ou carrément permet de définir la durée théorique de l'enquête 
    date_debut = Column(DateTime, nullable=True)
    date_fin = Column(DateTime, nullable=True)

    
    # 1. Permet de fermer une affectation (mission terminée) sans la supprimer
    est_actif = Column(Boolean, default=True)

    # Souvent pour les enquêtes, les quotas ne sont pas juste un eff général de 
    # personne à questionner, des fois on doit atteindre un effectif par modalité de 
    # variable, c'est ce que nous faisons en créant un fichier de configuration
    # 2. C'est ici qu'on va mettre cette configuration de quotas par variables
    # Ex: { "sexe": {"H": 10, "F": 10}, "ethnie": {"A": 5, "B": 5} }
    objectifs_quota = Column(JSON, nullable=True)

    # Relations de navigation
    controleur = relationship("User", back_populates="affectations")
    zone = relationship("Zone", back_populates="affectations")
