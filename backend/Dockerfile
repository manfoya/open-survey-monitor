# Utiliser une image Python officielle légère
FROM python:3.12-slim

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances système nécessaires
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copier les fichiers de dépendances
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier le reste du code de l'application
COPY . .

# Exposer le port sur lequel l'application s'exécute
EXPOSE 8000

# Commande pour démarrer l'application
# Donner les droits d'exécution au script d'entrypoint
RUN chmod +x /app/scripts/entrypoint.sh

# Définir le point d'entrée pour lancer les migrations puis l'app
ENTRYPOINT ["/app/scripts/entrypoint.sh"]

# Commande par défaut (passée à l'entrypoint via "$@")
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
