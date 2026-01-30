# Guide : Exporter les données CSPro vers MySQL Hostinger

Ce guide explique comment envoyer les données collectées (format CSPro `.csdb`) vers votre base de données MySQL sur Hostinger, afin qu'elles soient lisibles par l'application de monitoring.

## Outil Requis

L'outil à utiliser est **CSPro Export Data** (installé avec CSPro sur Windows).

## Pré-requis Techniques

Pour que l'export fonctionne directement vers Hostinger, il faut :
1.  **Driver ODBC MySQL** : Installer le [MySQL Connector/ODBC](https://dev.mysql.com/downloads/connector/odbc/) sur la machine Windows.
2.  **Autorisation IP** : Dans le panneau Hostinger -> Databases -> Remote MySQL, ajouter l'adresse IP de votre machine Windows (ou `%` pour autoriser tout le monde, mais attention à la sécurité).

---

## Procédure Pas à Pas

### 1. Ouvrir l'outil Export Data
Dans CSPro, allez dans **Tools** > **Export Data**.

### 2. Sélectionner les Données
1.  **Dictionary** : Choisissez le fichier dictionnaire (`.dcf`) de votre enquête.
2.  **Data File** : Choisissez le fichier de données (`.csdb`) que vous avez téléchargé depuis CSWeb ou récupéré des tablettes.

### 3. Configurer l'Export
C'est ici que tout se joue.

*   **Export Format** : Cochez **SQL Query**.
*   **Database Type** : Sélectionnez **MySQL**.
*   **Export Type** : Choisissez **Create Table and Load Data**.
    *   *Note* : Cela va créer une nouvelle table. C'est parfait pour notre système (ex: `QUESTIONNAIRE_ENQ_2025_JUIN`).

### 4. Paramétrer les Variables
Dans l'onglet "Items" ou "Attributes" :
*   Sélectionnez les variables à exporter.
*   **IMPORTANT** : Assurez-vous d'exporter les identifiants (UUID, Code Agent) et les variables de contrôle (GPS, Dates, Durée).
*   Cochez "Multiple Items" -> "As Separate Records" si vous avez des boucles (ex: liste des membres du ménage), sinon "Single Record" pour aplatir (recommandé pour la table principale).

### 5. Connexion à MySQL (Destination)
CSPro va vous demander la "Connection String" ou les paramètres :

*   **Server** : `193.203.168.147` (votre IP Hostinger)
*   **User** : `u100076301_enq2026`
*   **Password** : `Enq20252026`
*   **Database** : `u100076301_enq2026`
*   **Table Name** : Donnez un nom clair (ex: `DATA_2025_V1`).

### 6. Lancer l'Export
Cliquez sur le feu vert (Run).
Si tout est vert, les données sont désormais sur Hostinger !

---

## Étape Suivante (Dans l'Application)

Une fois l'export fini :
1.  Connectez-vous au Monitoring en tant que Directeur.
2.  Allez dans **Paramètres**.
3.  Dans "Table Source", sélectionnez la table que vous venez de créer (ex: `DATA_2025_V1`).
4.  Lancez la synchronisation.
