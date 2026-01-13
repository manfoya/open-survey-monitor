#!/bin/bash
# Script de gestion Docker pour la base de données

set -e

echo "🐳 Gestion Docker - Base de données PostgreSQL"
echo "=============================================="

# Fonction d'aide
show_help() {
    echo "Usage: ./scripts/docker.sh [COMMAND]"
    echo ""
    echo "Commandes disponibles:"
    echo "  start       Démarre PostgreSQL en arrière-plan"
    echo "  stop        Arrête PostgreSQL"
    echo "  restart     Redémarre PostgreSQL"
    echo "  logs        Affiche les logs de PostgreSQL"
    echo "  status      Affiche l'état des conteneurs"
    echo "  psql        Se connecte à PostgreSQL via psql"
    echo "  pgadmin     Démarre aussi pgAdmin (http://localhost:5050)"
    echo "  reset       Supprime et recrée la base (PERTE DE DONNÉES)"
    echo ""
}

# Vérification Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

# Vérification Docker Compose (nouvelle syntaxe)
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose n'est pas disponible"
    echo "   Assurez-vous d'avoir Docker avec le plugin Compose installé"
    exit 1
fi

COMMAND=${1:-start}

case $COMMAND in
    "start")
        echo "🚀 Démarrage de PostgreSQL..."
        docker compose up -d database
        
        echo "⏳ Attente que la base soit prête..."
        timeout 30 bash -c 'until docker compose exec database pg_isready -U survey_user -d open_survey_monitor; do sleep 1; done'
        
        echo "✅ PostgreSQL est prêt !"
        echo "   📊 Base de données: open_survey_monitor"
        echo "   👤 Utilisateur: survey_user"
        echo "   🔗 URL: postgresql://survey_user:survey_password_dev@localhost:5436/open_survey_monitor"
        ;;
    
    "stop")
        echo "🛑 Arrêt de PostgreSQL..."
        docker compose down
        echo "✅ PostgreSQL arrêté"
        ;;
    
    "restart")
        echo "🔄 Redémarrage de PostgreSQL..."
        docker compose restart database
        echo "✅ PostgreSQL redémarré"
        ;;
    
    "logs")
        echo "📋 Logs PostgreSQL (Ctrl+C pour arrêter):"
        docker compose logs -f database
        ;;
    
    "status")
        echo "📊 État des conteneurs:"
        docker compose ps
        ;;
    
    "psql")
        echo "🔗 Connexion à PostgreSQL..."
        docker compose exec database psql -U survey_user -d open_survey_monitor
        ;;
    
    "pgadmin")
        echo "🚀 Démarrage de PostgreSQL + pgAdmin..."
        docker compose --profile admin up -d
        
        echo "✅ Services démarrés !"
        echo "   🗄️  PostgreSQL: localhost:5436"
        echo "   🌐 pgAdmin: http://localhost:5050"
        echo "      📧 Email: admin@survey.com"
        echo "      🔐 Password: admin123"
        ;;
    
    "reset")
        echo "⚠️  ATTENTION: Cette opération va supprimer toutes les données!"
        read -p "Êtes-vous sûr? (oui/non): " confirm
        if [ "$confirm" = "oui" ]; then
            echo "🗑️  Suppression des conteneurs et volumes..."
            docker compose down -v
            echo "🚀 Redémarrage avec base vide..."
            docker compose up -d database
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