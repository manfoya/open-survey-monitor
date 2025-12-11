
# FEUILLE DE ROUTE : BACKEND DASHBOARD CSPRO

## Jalon 0 : Initialisation & Environnement                                         - [x]
*Objectif : Avoir un dossier propre et prêt à recevoir du code.*
- [x] Création de l'arborescence des dossiers (`app/`, `scripts/`, etc.).
- [x] Création de l'environnement virtuel (`venv`).
- [x] Installation des dépendances (`pip install`).
- [x] Configuration du fichier `.env` (Secrets et URL BDD).
- [x] Création de la base de données PostgreSQL vide (`dashboard_db`).

## Jalon 1 : Fondations de la Base de Données (En cours)
*Objectif : Que FastAPI puisse parler à PostgreSQL et créer les tables.*
- [x] Configuration de `app/core/database.py` (Le moteur).
- [x] Codage des Modèles SQLAlchemy (`app/models/`):
    - [x] `users.py` (Utilisateurs + Hiérarchie + Rôles, Cde_Cspro).
    - [x] `zones.py` (Zones géo + Affectations).
    - [x] `survey.py` (Données collectées + Sexe + Statut).
    - [x] `settings.py` (Paramètres Directeur).
- [x] Mise en place d'**Alembic** (Système de migration).
- [x] Première migration : Création effective des tables dans PostgreSQL.

## Jalon 2 : Authentification & Hiérarchie (Qui est qui ?)
*Objectif : On peut créer des utilisateurs et se connecter.*
- [x] Script de "Seed" (Remplissage initial) : Créer le compte "Directeur" par défaut.
- [x] Codage de `app/schemas/users.py` (Validation des données entrée/sortie).
- [x] Codage de `app/core/security.py` (Hashage mot de passe + Token JWT).
- [x] Route API `POST /login` (Récupérer un Token).
- [ ] Route API `GET /users/me` (Tester "Qui suis-je ?").
- [ ] Gestion des permissions : Vérifier qu'un Agent ne peut pas voir les infos du Directeur.

## Jalon 3 : Le Moteur ETL (Script de Synchro)
*Objectif : Aspirer les données de CSPro (MySQL) vers Dashboard (Postgres).*
- [ ] Préparation des fausses données CSPro .0dans une base MySQL locale.
- [ ] Codage du script `backend/scripts/sync_cspro.py` :
    - [ ] Connexion aux deux bases (Source MySQL -> Cible Postgres).
    - [ ] Extraction : Lecture des données brutes.
    - [ ] Transformation : Nettoyage, calcul des durées, extraction du Sexe.
    - [ ] Chargement : Insertion/Mise à jour dans `dashboard_db`.
- [ ] Test manuel du script (Lancement en ligne de commande).

## Jalon 4 : API de Visualisation (Le Cerveau du Dashboard)
*Objectif : Servir les données à la carte et aux graphiques.*
- [ ] Route `GET /map/points` :
    - [ ] Filtrage dynamique (Agent voit ses 15 points,le contrôleur voit son équipe,
    le superviseur voit ce qu'il doit voir, Directeur voit tout).
    - [ ] Formatage GeoJSON pour la carte.
- [ ] Route `GET /stats/kpi` :
    - [ ] Calcul du taux de réalisation journalier, global, des questionnaires partiels,
    complets, de ce qui reste à faire
    - [ ] Calcul du taux par Sexe.
- [ ] Route `GET /alerts` :
    - [ ] Renvoyer les questionnaires "suspects" (Hors zone, Durée courte, fait hors jours valide).

## Jalon 5 : Finalisation & Déploiement Test
*Objectif : Tout tourne ensemble.*
- [ ] Configuration du CRON Job (Automatisation du script toutes les 15 min).
- [ ] Documentation de l'API (Swagger UI vérifié).
- [ ] Nettoyage du code (Linting).

