#!/bin/bash
# Script de gestion des migrations Alembic

set -e

echo "🗄️  Gestion des migrations de base de données"
echo "============================================"

# Vérification environnement virtuel
if [ ! -d "venv" ]; then
    echo "❌ Environnement virtuel non trouvé. Lancez d'abord './scripts/setup.sh'"
    exit 1
fi

# Activation de l'environnement
source venv/bin/activate

# Fonction d'aide
show_help() {
    echo "Usage: ./scripts/migrate.sh [COMMAND]"
    echo ""
    echo "Commandes disponibles:"
    echo "  init        Initialise Alembic (première utilisation)"
    echo "  generate    Génère une nouvelle migration"
    echo "  upgrade     Applique les migrations en attente"
    echo "  downgrade   Revient à la migration précédente"
    echo "  current     Affiche la migration actuelle"
    echo "  history     Affiche l'historique des migrations"
    echo "  reset       Remet à zéro la base (ATTENTION: perte de données)"
    echo ""
}

# Commande par défaut
COMMAND=${1:-upgrade}

case $COMMAND in
    "init")
        echo "🔧 Initialisation d'Alembic..."
        alembic init alembic
        echo "✅ Alembic initialisé"
        ;;
    
    "generate")
        if [ -z "$2" ]; then
            echo "❌ Nom de migration requis"
            echo "Usage: ./scripts/migrate.sh generate \"nom_de_la_migration\""
            exit 1
        fi
        echo "📝 Génération de la migration: $2"
        alembic revision --autogenerate -m "$2"
        echo "✅ Migration générée"
        ;;
    
    "upgrade")
        echo "⬆️  Application des migrations..."
        alembic upgrade head
        echo "✅ Migrations appliquées"
        ;;
    
    "downgrade")
        echo "⬇️  Retour à la migration précédente..."
        alembic downgrade -1
        echo "✅ Migration annulée"
        ;;
    
    "current")
        echo "📍 Migration actuelle:"
        alembic current
        ;;
    
    "history")
        echo "📜 Historique des migrations:"
        alembic history --verbose
        ;;
    
    "reset")
        echo "⚠️  ATTENTION: Cette opération va supprimer toutes les données!"
        read -p "Êtes-vous sûr? (oui/non): " confirm
        if [ "$confirm" = "oui" ]; then
            echo "🗑️  Suppression de toutes les tables..."
            alembic downgrade base
            echo "⬆️  Recréation des tables..."
            alembic upgrade head
            echo "✅ Base de données réinitialisée"
        else
            echo "❌ Opération annulée"
        fi
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