# Guide de Déploiement VPS

Ce projet est configuré pour être déployé facilement avec Docker et Docker Compose.

> [!TIP]
> Si vous préférez un déploiement manuel (sans Docker), consultez le guide **[DEPLOYMENT_MANUAL.md](./DEPLOYMENT_MANUAL.md)** (pas à jour).

## Prérequis

Sur votre serveur VPS (Ubuntu/Debian recommandé) :

1.  **Installer Docker et Docker Compose**
    ```bash
    # Mettre à jour les paquets
    sudo apt update
    sudo apt install ca-certificates curl gnupg

    # Ajouter la clé GPG officielle de Docker
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    # Ajouter le dépôt
    echo \
      "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Installer Docker
    sudo apt update
    sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    ```

2.  **Cloner le projet**
    ```bash
    git clone <votre-depot-git> open-survey-monitor
    cd open-survey-monitor
    ```

## Configuration

1.  **Configurer les variables d'environnement**
    ```bash
    cp .env.example .env
    nano .env
    ```
    Modifiez les valeurs dans `.env` pour votre production (mots de passe, domaine, etc.).

> **Note**: `NEXT_PUBLIC_API_URL` est utilisé par le navigateur. Si vous n'avez pas de domaine, mettez l'IP publique du VPS.

## Lancement

1.  **Construire et lancer les conteneurs**
    ```bash
    docker compose up -d --build
    ```

2.  **Vérifier que tout tourne**
    ```bash
    docker compose ps
    ```

3.  **Accès**
    - Frontend : `http://<votre-ip>:3000`
    - Backend API : `http://<votre-ip>:8000/docs`
    - Base de données : Port 5432 (interne au réseau docker)

    > **Note** : Le conteneur backend exécute automatiquement les migrations de base de données et le seed initial (création du super admin) au démarrage.


## Sécurisation (HTTPS & Domaine)

Pour mettre votre site en ligne avec un vrai nom de domaine (ex: `mon-site.com`) et HTTPS :

1.  **Installer Nginx** (Reverse Proxy)
    ```bash
    sudo apt install nginx
    ```

2.  **Configurer Nginx**
    Copiez le fichier de configuration exemple :
    ```bash
    sudo cp nginx.conf.example /etc/nginx/sites-available/open-survey-monitor
    ```
    Editez le fichier pour mettre votre nom de domaine :
    ```bash
    sudo nano /etc/nginx/sites-available/open-survey-monitor
    # Remplacez "example.com" par votre domaine
    ```
    Activez le site :
    ```bash
    sudo ln -s /etc/nginx/sites-available/open-survey-monitor /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

3.  **Installer Certbot (SSL gratuit)**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d votre-domaine.com
    ```
    Certbot va configurer automatiquement les certificats SSL et le renouvellement.

## Mise à jour

Pour mettre à jour l'application après un `git pull` :

```bash
docker compose up -d --build
```
Ceci reconstruira les images avec le nouveau code et relancera les conteneurs.
