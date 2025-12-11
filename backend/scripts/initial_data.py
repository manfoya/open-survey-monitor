# backend/scripts/initial_data.py

import sys
import os

# On utilise os.path.dirname pour pouvoir trouver le dossier app
# peu importe d'où on lance le script dans le terminal.
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.users import User, RoleEnum
from app.models.zones import Affectation, Zone
from app.core.security import get_password_hash

def init_db(db: Session):
    """
    Sert à créer les données minimales pour que l'application démarre.
    """
    # 1. On vérifie d'abord si ça existe avant de créer,
    # cela permet de relancer le script 10 fois sans créer 10 erreurs ou doublons.
    user = db.query(User).filter(User.username == "admin").first()
    
    if not user:
        print("Création du Super Admin (Directeur)...")
        user = User(
            username="admin",
            password_hash=get_password_hash("admin123"), # standard pour le code et le test mais à changer en prod
            role=RoleEnum.directeur,
            cspro_code=None # Un directeur n'enquête pas
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print("Directeur créé ! Login: 'admin' / Pass: 'admin123'")
    else:
        print("Le Directeur existe déjà. Rien à faire.")

def main():
    # Création de la session BDD juste pour ce script
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        # Le bloc 'finally' garantit que la connexion est fermée proprement
        # même si le script plante au milieu (ex: erreur réseau).
        db.close()

if __name__ == "__main__":
    main()
