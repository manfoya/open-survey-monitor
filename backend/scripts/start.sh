#!/bin/bash
# Script de démarrage du serveur FastAPI

set -e

echo "🚀 Démarrage du serveur Open Survey Monitor"
echo "=========================================="

"""# Vérification environnement virtuel
if [ ! -d "venv" ]; then
    echo "❌ Environnement virtuel non trouvé. Lancez d'abord './scripts/setup.sh'"
    exit 1
fi

# Vérification fichier .env
if [ ! -f ".env" ]; then
    echo "⚠️  Fichier .env non trouvé. Création d'un exemple..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "📝 Fichier .env créé depuis .env.example"
        echo "⚠️  Pensez à modifier les variables dans .env avant de continuer"
        exit 1
    else
        echo "❌ Aucun fichier .env.example trouvé"
        exit 1
    fi
fi
"""
# Activation de l'environnement
echo "📦 Activation de l'environnement virtuel..."
# source venv/bin/activate

# Mode de développement par défaut
MODE=${1:-dev}

if [ "$MODE" = "prod" ]; then
    echo "🏭 Démarrage en mode PRODUCTION"
    uvicorn app.main:app --host 0.0.0.0 --port 8000
elif [ "$MODE" = "dev" ]; then
    echo "🔧 Démarrage en mode DÉVELOPPEMENT"
    echo "   - Hot reload activé"
    echo "   - Interface disponible sur http://localhost:8000"
    echo "   - Documentation API sur http://localhost:8000/docs"
    echo ""
    uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
else
    echo "❌ Mode non reconnu: $MODE"
    echo "Usage: ./scripts/start.sh [dev|prod]"
    exit 1
fi
