#!/bin/bash
set -e

# Se placer dans le répertoire de l'application
cd /app

echo "Running Alembic migrations..."
alembic upgrade head

echo "Running initial data seeding..."
python -m scripts.initial_data

echo "Starting application..."
exec "$@"
