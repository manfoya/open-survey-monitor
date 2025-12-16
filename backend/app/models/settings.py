# backend/app/models/settings.py

from sqlalchemy import Column, Integer, String, Time, Text, Boolean
from app.core.database import Base

class GlobalSettings(Base):
    """
    Table de vérification
    Cette table n'a pas à contenir plusieurs lignes.
    Elle ne contiendra qu'une seule ligne (ID=1) qui stocke la configuration actuelle.
    Le Directeur modifie cette unique ligne pour changer les configs/règles/params de l'enquêtes pour tout le monde.

    Dans le plan auquel vous pouvez vous référez, on a défini déjà des RÈGLES que le Directeur défini
    et que les agents de terrain doivent respecter
    """
    __tablename__ = "global_settings"

    # On force la clé primaire. Dans la pratique, on s'assurera qu'elle est toujours égale à 1.
    id = Column(Integer, primary_key=True) 
    
    # 1. RÈGLES DE TEMPS
    
    # Interrupteur : Activer ou non la vérification des horaires ?
    check_heure = Column(Boolean, default=False)

    # Heures limites pour considérer une enquête comme valide.
    # Si une enquête arrive à 23h00, le système pourra la marquer en rouge automatiquement.
    heure_debut_travail = Column(Time, nullable=True) # Ex: 07:00
    heure_fin_travail = Column(Time, nullable=True)   # Ex: 18:00
    
    # 2. RÈGLES DE JOURS

    # Interrupteur : Activer ou non l'interdiction de certains jours ?
    check_jours = Column(Boolean, default=False)

    # Jours Interdits (Liste de choix multiple)
    # 
    # Comment ça marche techniquement ?
    # La base de données SQL standard ne gère pas nativement les "listes".
    # On stocke donc les jours choisis sous forme de chaîne de caractères séparée par des virgules.
    # Exemple stocké : "Dimanche,Samedi"
    # Côté Application (API/Frontend) : On transformera ce texte en liste ["Dimanche", "Samedi"] 
    # pour afficher les cases à cocher.
    jours_interdits = Column(String, default="Dimanche")
    
    # 3. RÈGLES DE ...(GPS)
    
    # Interrupteur : Activer ou non la vérification GPS ?
    check_gps = Column(Boolean, default=True)

    # Distance en mètres.
    # Le système compare la position GPS de l'enquête (Table SurveyData) 
    # avec le point central de la zone (Table Zone).
    # Si Distance > tolerance_gps_metres, alors c'est un hors-zone ===> arlerte.
    tolerance_gps_metres = Column(Integer, default=500)
    
    # 4. RÈGLES DE.... (DURÉE FAIT SUR UN QUESTIONNAIRE)
    # section pour éviter les questionnaires bâclés en 2 minutes.

    # Interrupteur : Vérifier la durée ?
    check_duree = Column(Boolean, default=True)
    
    # Durée minimale en minutes. Si l'enquête dure moins que ça, c'est suspect.
    min_duree_minutes = Column(Integer, default=10)

    # 5. RÈGLES DE QUOTA JOURNALIER (VITESSE)
    # section pour détecter un agent qui remplit des fiches fictives à la chaîne.

    # Interrupteur : Vérifier la vitesse de remplissage ?
    check_vitesse = Column(Boolean, default=True)

    # Nombre maximum d'enquêtes acceptables par jour pour un seul agent.
    # Au-delà, c'est supposé humainement impossible, donc c'est une alerte fraude.
    max_enquetes_par_jour = Column(Integer, default=20) 

    # 6. COMMUNICATION
    
    # Message affiché en haut du tableau de bord de tous les utilisateurs.
    # Utile pour les annonces urgentes (ex: "Synchronisez vos tablettes avant 18h ce soir !")
    # Type Text : permet d'écrire un message long contrairement à String qui est souvent limité.
    message_du_jour = Column(Text, nullable=True)
