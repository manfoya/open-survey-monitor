# Documentation API : Route `/surveys`

Cette documentation détaille le fonctionnement de la route de récupération des enquêtes et les variations de données selon les rôles utilisateurs.

## 1. Informations Générales
- **Endpoint Liste** : `GET /api/v1/surveys/` (Paginé)
- **Endpoint Carte** : `GET /api/v1/surveys/map` (Liste brute, tous les points)
- **Authentification** : Requise (Bearer Token)
- **Format de réponse** : JSON

## 2. Paramètres de Requête
| Paramètre | Type | Description |
| :--- | :--- | :--- |
| `page` | `int` | Numéro de la page (défaut: 1) |
| `size` | `int` | Éléments par page (max: 1000, défaut: 50) |
| `status` | `string` | Filtre par statut : `complet`, `partiel`, `refus` |
| `is_valid` | `boolean` | Filtre par validation QC (`true`/`false`) |
| `search` | `string` | Recherche par `questionnaire_uuid` ou `agent_code` |
| `sort_by` | `string` | Tri : `date_entretien`, `date_synchro`, `duree_minutes` |

---

## 3. Structure de la Réponse (Mocks par Rôle)

### A. Rôle : Directeur ou Superviseur 👑
*Accès complet aux données et aux résultats du Contrôle Qualité (QC).*

```json
{
  "items": [
    {
      "id": 101,
      "questionnaire_uuid": "abc-123-xyz",
      "agent_code": "AG99",
      "agent_name": "Alice M.",
      "status": "complet",
      "respondent_sex": "F",
      "latitude": 4.36,
      "longitude": 18.55,
      "date_entretien": "2026-01-30T09:00:00",
      "duree_minutes": 35,
      "is_valid": true,
      "qc_results": { 
        "timing_score": 95,
        "gps_match": true,
        "coherence_errors": 0 
      },
      "answers": { "q1": "Oui", "q2": 25 }
    }
  ],
  "meta": { "total_items": 1250, "total_pages": 25, "current_page": 1, "page_size": 50 }
}
```

### B. Rôle : Agent ou Contrôleur 👤
*Visibilité restreinte (soi-même ou équipe) et masquage des détails QC.*

```json
{
  "items": [
    {
      "id": 101,
      "questionnaire_uuid": "abc-123-xyz",
      "agent_code": "AG99",
      "agent_name": "Alice M.",
      "status": "complet",
      "respondent_sex": "F",
      "latitude": 4.36,
      "longitude": 18.55,
      "date_entretien": "2026-01-30T09:00:00",
      "duree_minutes": 35,
      "is_valid": true,
      "qc_results": null, 
      "answers": { "q1": "Oui", "q2": 25 }
    }
  ],
  "meta": { "total_items": 10, "total_pages": 1, "current_page": 1, "page_size": 50 }
}
```

### C. Données pour la Carte (Tous les points) 🗺️
*Format optimisé pour charger des centaines de points rapidement sans pagination.*

**Endpoint** : `GET /api/v1/surveys/map`

```json
[
  { "id": 1, "latitude": 4.361, "longitude": 18.554, "status": "complet" },
  { "id": 2, "latitude": 4.365, "longitude": 18.559, "status": "partiel" },
  { "id": 3, "latitude": 4.370, "longitude": 18.560, "status": "refus" },
  { "id": 4, "latitude": 4.358, "longitude": 18.550, "status": "complet" }
]
```

---

## 4. Guide pour l'Équipe Front-end (Visualisation)

Pour rendre les données exploitables et visuelles, voici les recommandations d'implémentation :

### 🎨 Codes Couleurs (Statuts & Carte)

Que ce soit dans la liste ou sur la carte, le code couleur doit être cohérent :

| Statut | Code Couleur | Hexadécimal | Usage |
| :--- | :--- | :--- | :--- |
| `complet` | 🟢 Vert | `#22C55E` | Enquêtes terminées et validées. |
| `partiel` | 🟡 Orange | `#F59E0B` | En cours, abandonnées ou incomplètes. |
| `refus` | 🔴 Rouge | `#EF4444` | Ménages ayant refusé de participer. |

### 📍 Implémentation de la Carte
- **Markers** : Utilisez des marqueurs circulaires colorés selon le tableau ci-dessus.
- **Clustering** : Si le nombre de points dépasse 500, activez le *Marker Clustering* pour garder une carte fluide.
- **Popup** : Au clic sur un point, affichez une popup avec :
    - L'ID / UUID de l'enquête.
    - Le nom de l'agent.
    - Un lien "Voir les détails" qui redirige vers la vue détaillée.

### ✅ Indicateur QC (Validation)
Ne vous contentez pas d'un texte "Vrai/Faux" pour le champ `is_valid` :
- **Si `is_valid: true`** : Icône ✅ (Checkmark circle)
- **Si `is_valid: false`** : Icône ⚠️ (Warning triangle)

### 📊 Affichage des résultats QC (`qc_results`)
- **Conditionnel** : N'affichez la section "Détails QC" que si `qc_results` n'est pas `null`.
- **Visuel** : Si disponible, transformez les scores numériques en **Progress Bars** ou en **Jauges de couleur**.

### 🗺️ Géolocalisation
- Ajoutez un bouton d'action rapide "Voir sur la carte" si les champs `latitude` et `longitude` sont présents.

### ⏱️ Temps d'entretien
- Si `duree_minutes` < 10 (pour un long questionnaire), marquez la ligne en rouge discret pour signaler une anomalie potentielle à l'utilisateur.
