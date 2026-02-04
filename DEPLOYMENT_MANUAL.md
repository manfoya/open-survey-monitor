# Guide de Déploiement Manuel (Sans Docker)

Ce guide explique comment installer l'application directement sur votre VPS.

## 1. Prérequis Système

Installez les dépendances nécessaires sur Ubuntu/Debian :

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip nodejs npm postgresql postgresql-contrib nginx git
```

## 2. Base de données PostgreSQL

Configurez PostgreSQL :

```bash
# Connectez-vous à postgres
sudo -u postgres psql

# Dans le prompt psql :
CREATE DATABASE open_survey_monitor;
CREATE USER survey_user WITH PASSWORD 'votre_mot_de_passe_robuste';
GRANT ALL PRIVILEGES ON DATABASE open_survey_monitor TO survey_user;
\q
```

## 3. Installation du Backend (FastAPI)

```bash
cd /opt
sudo git clone <votre-depot> open-survey-monitor
sudo chown -R $USER:$USER /opt/open-survey-monitor
cd /opt/open-survey-monitor/backend

# Créer l'environnement virtuel et installer les dépendances
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configurer l'environnement
cp .env.example .env
# Modifiez .env pour pointer vers la base locale :
# DATABASE_URL=postgresql://survey_user:votre_mot_de_passe_robuste@localhost:5432/open_survey_monitor

# Lancer les migrations de base de données
alembic upgrade head

# Lancer le seed initial
python scripts/initial_data.py
```

## 4. Installation du Frontend (Next.js)

```bash
cd /opt/open-survey-monitor/frontend

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Modifiez NEXT_PUBLIC_API_URL=http://<IP-DU-VPS>:8000/api/v1

# Construire l'application
npm run build
```

## 5. Gestion des Processus (PM2)

Il est recommandé d'utiliser `PM2` pour que l'application reste active en arrière-plan.

```bash
sudo npm install -g pm2

# Lancer le Backend
cd /opt/open-survey-monitor/backend
pm2 start "venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000" --name survey-backend

# Lancer le Frontend
cd /opt/open-survey-monitor/frontend
pm2 start "npm start" --name survey-frontend

# Sauvegarder la configuration PM2 pour redémarrage auto
pm2 save
pm2 startup
```

## 6. Reverse Proxy (Nginx)

Configurez Nginx pour rediriger le trafic (optionnel mais recommandé, surtout pour le HTTPS).

Créez un fichier `/etc/nginx/sites-available/survey` :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location /api/v1 {
        proxy_pass http://127.0.0.1:8000/api/v1;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activez le site :
```bash
sudo ln -s /etc/nginx/sites-available/survey /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```
