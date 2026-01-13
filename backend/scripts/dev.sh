#!/bin/bash
# Script de développement - Commandes utiles pour le développement

set -e

echo "🛠️  Outils de développement"
echo "==========================="

# Vérification environnement virtuel
if [ ! -d "venv" ]; then
    echo "❌ Environnement virtuel non trouvé. Lancez d'abord './scripts/setup.sh'"
    exit 1
fi

source venv/bin/activate

# Fonction d'aide
show_help() {
    echo "Usage: ./scripts/dev.sh [COMMAND]"
    echo ""
    echo "Commandes disponibles:"
    echo "  format      Formate le code avec black et isort"
    echo "  lint        Vérifie le code avec flake8 et mypy"
    echo "  check       Lance format + lint + tests"
    echo "  deps        Met à jour requirements.txt"
    echo "  seed        Réexécute le seed des données initiales"
    echo "  clean       Nettoie les fichiers temporaires"
    echo "  logs        Affiche les logs en temps réel"
    echo "  shell       Lance un shell Python avec l'environnement chargé"
    echo ""
}

COMMAND=${1:-help}

case $COMMAND in
    "format")
        echo "✨ Formatage du code..."
        pip install -q black isort
        black app/ scripts/ --line-length 88
        isort app/ scripts/ --profile black
        echo "✅ Code formaté"
        ;;
    
    "lint")
        echo "🔍 Analyse du code..."
        pip install -q flake8 mypy
        flake8 app/ --max-line-length 88 --ignore E203,W503
        mypy app/ --ignore-missing-imports
        echo "✅ Analyse terminée"
        ;;
    
    "check")
        echo "🔄 Vérification complète..."
        $0 format
        $0 lint
        ./scripts/test.sh
        echo "✅ Toutes les vérifications passées"
        ;;
    
    "deps")
        echo "📝 Mise à jour des dépendances..."
        pip freeze > requirements.txt
        echo "✅ requirements.txt mis à jour"
        ;;
    
    "seed")
        echo "🌱 Réexécution du seed des données initiales..."
        python scripts/initial_data.py
        echo "✅ Données initiales mises à jour"
        ;;
    
    "clean")
        echo "🧹 Nettoyage des fichiers temporaires..."
        find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
        find . -type f -name "*.pyc" -delete 2>/dev/null || true
        find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
        rm -rf .pytest_cache/ htmlcov/ .coverage 2>/dev/null || true
        echo "✅ Nettoyage terminé"
        ;;
    
    "logs")
        echo "📋 Affichage des logs (Ctrl+C pour arrêter)..."
        tail -f logs/*.log 2>/dev/null || echo "Aucun fichier de log trouvé"
        ;;
    
    "shell")
        echo "🐍 Lancement du shell Python interactif..."
        python -c "
import sys
sys.path.insert(0, '.')
from app.core.database import get_db
from app.models import *
print('Environment loaded. Available: get_db, models')
" -i
        ;;
    
    "help"|"-h"|"--help")
        show_help
        ;;
    
    *)
        echo "❌ Commande non reconnue: $COMMAND"
        show_help
        exit 1
        ;;
esac