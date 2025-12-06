# backend/app/core/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# 1. Charger les secrets
# Le code va lire le fichier .env pour trouver le mot de passe de la BDD.
# C'est une sécurité : on n'écrit pas de mot de passe en clair dans du code.
load_dotenv()

# 2. L'URL de connexion
# C'est l'adresse exacte de la base de données.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# 3. Le Moteur (Engine)
# C'est le câble physique branché à la base de données. 
# Il gère la connexion réseau brute avec PostgreSQL.
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 4. La SessionLocal 
# autocommit=False : Sécurité. On oblige le développeur à dire explicitement "Sauvegarde !"
# autoflush=False : On attend la fin pour tout envoyer d'un coup.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 5. La classe Base
# Quand on crée "class User(Base)", on dit à SQLAlchemy : 
# "Cette classe User correspond à une table dans la base de données".
# Si une classe n'hérite pas de Base, SQLAlchemy l'ignore.
Base = declarative_base()

# 6. La fonction get_db (Injection de Dépendance)
def get_db():
    db = SessionLocal() # -> On ouvre une nouvelle connexion dédiée pour cette requête.
    try:
        yield db # -> On "prête" cette connexion à la route pour qu'elle fasse son travail (lire/écrire).
    finally:
        db.close() # -> Quoi qu'il arrive (même si la route plante avec une erreur !),
#      le code reprend ici et exécute db.close().
# POURQUOI ? Pour ne jamais laisser une connexion ouverte inutilement ("Connection Leak"),
# ce qui ferait planter le serveur au bout de quelques heures.

