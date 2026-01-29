#!/bin/bash
# Script d'installation et configuration initiale du projet

set -e

echo "🚀 Configuration du projet Open Survey Monitor Backend"
echo "=================================================="

# Vérification Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 n'est pas installé"
    exit 1
fi

echo "✅ Python $(python3 --version) détecté"

# Vérification Docker
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker n'est pas installé - la base de données ne pourra pas démarrer"
    echo "   Installez Docker pour utiliser PostgreSQL en local"
else
    echo "✅ Docker détecté"
fi

# Création environnement virtuel
if [ ! -d "venv" ]; then
    echo "📦 Création de l'environnement virtuel..."
    python3 -m venv venv
    echo "✅ Environnement virtuel créé"
else
    echo "ℹ️  Environnement virtuel déjà existant"
fi

# Activation et installation des dépendances
echo "📥 Installation des dépendances..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Création du fichier .env si nécessaire
if [ ! -f ".env" ]; then
    echo "📝 Création du fichier .env..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Fichier .env créé depuis .env.example"
        echo "⚠️  Pensez à modifier les variables dans .env"
    else
        echo "⚠️  Fichier .env.example non trouvé, création manuelle du .env recommandée"
    fi
fi

# Démarrage de PostgreSQL via Docker
if command -v docker &> /dev/null; then
    echo "🐳 Démarrage de PostgreSQL via Docker..."
    ./scripts/docker.sh start
    
    # Attendre que la base soit prête
    sleep 3
fi

# Initialisation de la base de données et seed des données
echo "🗄️  Initialisation de la base de données..."
if command -v ./scripts/migrate.sh &> /dev/null; then
    ./scripts/migrate.sh upgrade
else
    alembic upgrade head
fi

echo "🌱 Création des données initiales (seed)..."
python scripts/initial_data.py

echo ""
echo "✅ Configuration terminée avec succès!"
echo ""
echo "Services disponibles:"
if command -v docker &> /dev/null; then
    echo "  🐳 PostgreSQL: localhost:5432 (via Docker)"
fi
echo "  👤 Super Admin: login='admin' / password='admin123'"
echo ""
echo "Prochaines étapes:"
echo "  1. Lancer './scripts/start.sh' pour démarrer le serveur"
echo "  2. Accéder à http://localhost:8000/docs pour l'API"
if command -v docker &> /dev/null; then
    echo "  3. Optionnel: './scripts/docker.sh pgadmin' pour l'interface d'admin DB"
fi
