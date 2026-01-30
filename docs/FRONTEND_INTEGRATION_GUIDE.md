# Guide d'Intégration Frontend : Surveys, Stats & Settings

Ce document détaille la logique métier des 3 modules clés du Backend Open Survey Monitor. Il a pour but d'aligner l'équipe Frontend sur le fonctionnement des données.

---

## 1. Module SETTINGS (Le "Cerveau")
**Endpoint** : `/api/v1/settings`

C'est ici que le Directeur définit les règles du jeu. Le Backend est conçu pour être "agnostique" : il ne connaît pas à l'avance le nom de la table SQL ou les colonnes. C'est aux Settings de lui dire.

### Fonctionnement :
1.  **Source de Données** : Le champ `target_table_name` dit au backend "Va lire la table `ENQUETE_2025_V2`".
2.  **Mapping** : Les champs `variable_...` (ex: `variable_indicateur_partiel`) disent au backend "La colonne `is_draft` correspond au statut Partiel".

### 💡 Frontend Expectations (Ce qu'on attend du Front) :
*   **NE JAMAIS hardcoder** les noms de tables ou d'années. Toujours appeler `GET /api/v1/settings/tables` pour remplir la liste déroulante "Source".
*   Dans l'écran de configuration, afficher les champs de mapping (UUID, Agent, Partiel) pour que le Directeur puisse ajuster si le nom des variables change dans CSPro.

---

## 2. Module STATS (La "Vue Aérienne")
**Endpoint** : `/api/v1/stats/dashboard`

Ce module sert uniquement à **compter**. Il prend des milliers de lignes et en fait 5 chiffres (Total, Valides, Suspects...).

### Fonctionnement :
1.  **Hiérarchie Stricte** :
    *   Un **Agent** ne voit que ses chiffres (100% perso).
    *   Un **Contrôleur** voit la somme de son équipe (pas toute la zone, juste SES agents).
    *   Le **Directeur** voit tout.
2.  **Pas de Données Brutes** : Ce endpoint ne renvoie PAS de latitude/longitude, ni de noms de personnes. Juste des totaux.

### 💡 Frontend Expectations :
*   Utiliser cette route pour les **Widgets** (Kpi Cards) en haut du Dashboard.
*   Utiliser cette route pour les **Graphiques** (Pie Charts, Bar Charts).
*   **NE PAS** chercher à faire une carte (Map) avec cette route. Elle ne contient pas de GPS.

---

## 3. Module SURVEYS (La "Vue Détaillée")
**Endpoint** : `/api/v1/surveys/`

Ce module est le **Tableur**. Il renvoie la liste ligne par ligne des enquêtes. C'est la source de vérité pour l'exploration.

### Fonctionnement :
1.  **Pagination** : Indispensable car il peut y avoir 50 000 enquêtes.
2.  **QC (Contrôle Qualité)** :
    *   Chaque ligne contient `is_valid` (Vrai/Faux).
    *   Chaque ligne contient `qc_results` (Détails : "Trop court", "Hors zone").
    *   **Sécurité** : Pour un Agent ou un Contrôleur, `qc_results` est vidé (`null`) par le serveur. Ils voient le drapeau rouge, mais pas la raison technique (anti-triche).

### 💡 Frontend Expectations :
*   **La Carte (Map)** : C'est CETTE route qu'il faut utiliser. Chaque objet contient `latitude` et `longitude`. Boucler dessus pour afficher les Pins.
*   **Le DataGrid** : Afficher les colonnes "Date", "Agent" et "Statut".
*   **Les Drapeaux** : Si `is_valid == false`, afficher une alerte rouge.
*   **Le Détail** : Si l'utilisateur a le droit (Directeur/Superviseur), afficher le contenu de `qc_results` au survol ou au clic. Si c'est un Agent, ne rien afficher (c'est normal d'avoir `null`).

---

## Résumé du Flux Idéal

1.  **Login** -> Récupération du Rôle.
2.  **Dashboard Load** :
    *   Appel `/stats/dashboard` -> Affichage des **Gros Chiffres** en haut.
    *   Appel `/surveys/` -> Affichage de la **Carte** et du **Tableau** en bas.
3.  **Action Utilisateur** :
    *   Le Directeur va dans **Settings** -> Appel `/settings/tables` -> Il change la table -> Le Dashboard se met à jour.
