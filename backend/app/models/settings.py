# backend/app/models/settings.py

from sqlalchemy import Column, Integer, String, Time, Text
from app.core.database import Base

class GlobalSettings(Base):
    """
    TABLE DE CONFIGURATION
    Cette table n'a pas à contenir plusieurs lignes.
    Elle ne contiendra qu'une seule ligne (ID=1) qui stocke la configuration actuelle.
    Le Directeur modifie cette unique ligne pour changer les configs/règles/params de l'enquêtes pour tout le monde.

    Dans le plan auquel vous pouvez vous référez, on a défini déjà des RÈGLES que le Directeur défini
    et que les agents de terrain doivent respecter
    """
    __tablename__ = "global_settings"

    # On force la clé primaire. Dans la pratique, on s'assurera qu'elle est toujours égale à 1.
    id = Column(Integer, primary_key=True) 
    
    # RÈGLES DE TEMPS (DISCIPLINE)
    
    # Heures limites pour considérer une enquête comme valide.
    # Si une enquête arrive à 23h00, le système pourra la marquer en rouge automatiquement.
    heure_debut_travail = Column(Time, nullable=True) # Ex: 07:00
    heure_fin_travail = Column(Time, nullable=True)   # Ex: 18:00
    
    # Jours Interdits (Liste de choix multiple)
    # 
    # Comment ça marche techniquement ?
    # La base de données SQL standard ne gère pas nativement les "listes".
    # On stocke donc les jours choisis sous forme de chaîne de caractères séparée par des virgules.
    # Exemple stocké : "Dimanche,Samedi"
    # Côté Application (API/Frontend) : On transformera ce texte en liste ["Dimanche", "Samedi"] 
    # pour afficher les cases à cocher.
    jours_interdits = Column(String, default="Dimanche")
    
    # RÈGLES DE QUALITÉ 
    
    # Distance en mètres.
    # Le système compare la position GPS de l'enquête (Table SurveyData) 
    # avec le point central de la zone (Table Zone).
    # Si Distance > tolerance_gps_metres, alors c'est une ALERTE.
    # Mais ceci est d'autant plus pratique si les enquêteurs sont réparti dans des zones 
    # bien distincts, si tout le monde dans un seul campusce n'est pas très utile
    tolerance_gps_metres = Column(Integer, default=500)
    
    # COMMUNICATION OU FAIRE PASSER UN MESSAGE
    
    # Message affiché en haut du tableau de bord de tous les utilisateurs.
    # Utile pour les annonces urgentes (ex: "Synchronisez vos tablettes avant 18h ce soir !")
    # Type Text : permet d'écrire un message long contrairement à String qui est souvent limité.
    message_du_jour = Column(Text, nullable=True)
