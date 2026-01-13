# Roadmap Frontend - Open Survey Monitor

**Version :** 1.0  
**Date :** Janvier 2026  
**Projet :** Dashboard de suivi d'enquêtes terrain CSPro

---

## 🎯 Vision du Projet

### Contexte Métier
Système de monitoring en temps réel pour enquêtes terrain utilisant CSPro. Le backend fournit une API complète pour gérer la hiérarchie des utilisateurs, les affectations géographiques, le contrôle qualité et les statistiques.

### Utilisateurs Cibles
- **Directeur** : Vue globale, configuration système, gestion d'équipes
- **Superviseur** : Supervision régionale, validation données
- **Contrôleur** : Gestion d'équipe terrain, suivi quotidien
- **Agent** : Consultation de ses propres données et missions

---

## 🏗️ Architecture API Backend

### Endpoints Disponibles

| Module | Endpoint | Fonctionnalité |
|--------|----------|----------------|
| **Auth** | `POST /api/v1/auth/login` | Authentification JWT |
| **Users** | `GET /api/v1/users/me` | Profil utilisateur |
| | `GET /api/v1/users/` | Liste équipe hiérarchique |
| | `POST /api/v1/users/` | Création utilisateur |
| | `PUT /api/v1/users/{id}` | Modification utilisateur |
| **Maps** | `GET /api/v1/maps/zones/` | Liste zones géographiques |
| | `POST /api/v1/maps/zones/` | Création zone |
| | `GET /api/v1/maps/affectations/` | Missions en cours |
| | `POST /api/v1/maps/affectations/` | Nouvelle affectation |
| **Settings** | `GET /api/v1/settings/` | Configuration qualité |
| | `PUT /api/v1/settings/` | Mise à jour paramètres |
| **Dictionary** | `GET /api/v1/dictionary/` | Variables questionnaire |
| | `POST /api/v1/dictionary/` | Nouvelle variable |

### Configuration Backend
- **URL API :** `http://127.0.0.1:8000`
- **Documentation :** `http://127.0.0.1:8000/docs`
- **Authentification :** Bearer JWT (30min de validité)
- **CORS :** Configuré pour `localhost:3000` et `localhost:8080`

---

## 📋 Spécifications Fonctionnelles

### 1. Authentification & Sécurité

#### Exigences
- Login avec username/password
- Stockage sécurisé du token JWT
- Auto-refresh des tokens avant expiration
- Logout avec nettoyage des sessions
- Protection des routes selon les rôles

#### Implémentation Recommandée
```javascript
// Structure du token reçu
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer"
}

// Headers à envoyer
Authorization: "Bearer eyJhbGci..."
```

### 2. Gestion des Utilisateurs

#### Hiérarchie Stricte
```
Directeur
└── Superviseur(s)
    └── Contrôleur(s)
        └── Agent(s)
```

#### Fonctionnalités par Rôle

| Rôle | Permissions |
|------|-------------|
| **Directeur** | Tout voir/modifier, créer utilisateurs, configurer système |
| **Superviseur** | Voir/modifier ses contrôleurs et agents, rapports régionaux |
| **Contrôleur** | Voir/modifier ses agents, suivi terrain quotidien |
| **Agent** | Consulter ses propres données uniquement |

#### Écrans Requis
- **Liste utilisateurs** : Tableau hiérarchique avec filtres
- **Création utilisateur** : Formulaire avec validation hiérarchie
- **Profil utilisateur** : Modification nom/mot de passe
- **Recherche par code CSPro** : Lookup rapide agents terrain

### 3. Cartographie & Affectations

#### Gestion des Zones
- **Visualisation carte** : Affichage zones avec cercles de tolérance
- **Création zone** : Formulaire avec sélection GPS
- **Paramètres zone** : Nom, coordonnées, rayon (défaut 500m)

#### Système d'Affectations
- **Vue calendrier** : Planning missions par contrôleur
- **Création mission** : Associer contrôleur + zone + quota + dates
- **Quotas complexes** : Support quotas croisés (sexe × ethnie, etc.)
- **Suivi temps réel** : Progress bars quotas vs réalisé

#### Structure Quotas
```json
{
  "type": "croise",
  "regles": [
    {
      "description": "Femmes Noires",
      "conditions": {"SEXE": "F", "ETHNIE": "NOIR"},
      "cible": 15,
      "actuel": 8
    }
  ]
}
```

### 4. Contrôle Qualité

#### Paramètres Configurables
- **GPS** : Tolérance distance zone (mètres)
- **Durée** : Temps minimum enquête (minutes)
- **Horaires** : Plages de travail autorisées
- **Jours** : Jours interdits (ex: Dimanche)
- **Vitesse** : Maximum enquêtes/jour/agent

#### Interface Settings
- Formulaire avec switches on/off pour chaque contrôle
- Validation en temps réel des valeurs
- Aperçu impact sur données existantes
- Message du jour pour communication équipes

### 5. Dashboard & Statistiques

#### Métriques Clés
- **Avancement global** : % objectifs atteints
- **Qualité** : % enquêtes conformes vs alertes
- **Productivité** : Enquêtes/jour/agent
- **Géographique** : Couverture zones vs planifié

#### Visualisations Recommandées
- Graphiques en barres (progression quotas)
- Cartes de chaleur (zones couvertes)
- Timeline (activité temps réel)
- Camemberts (répartition par variables)

---

## 🎨 Exigences UX/UI

### Design System
- **Style** : Dashboard professionnel, claire et lisible
- **Responsive** : Mobile-first pour consultation terrain
- **Couleurs** : 
  - Succès : Vert (#28a745)
  - Alertes : Orange (#ffc107) 
  - Erreurs : Rouge (#dc3545)
  - Info : Bleu (#007bff)

### Navigation
- **Sidebar** : Menu principal avec icônes
- **Breadcrumb** : Navigation contextuelle
- **Search** : Recherche globale utilisateurs/zones
- **Notifications** : Alertes temps réel (WebSocket recommandé)

### Composants Standards
- **DataTables** : Pagination, tri, filtres
- **Forms** : Validation frontend + backend
- **Modals** : Création/édition inline
- **Charts** : Graphiques interactifs (Chart.js/D3)
- **Maps** : Intégration Leaflet/OpenStreetMap

---

## 🛠️ Stack Technique Recommandée

### Frontend Framework
- **Next.js 14+** avec App Router pour l'architecture moderne
- **TypeScript** pour la robustesse et la productivité
- **Shadcn/ui** pour des composants UI cohérents et accessibles
- **Tailwind CSS** pour le styling utilitaire et responsive

### Pourquoi cette Stack ?

#### Next.js
- **SSR/SSG** : Améliore les performances et le SEO
- **App Router** : Routing moderne avec layouts partagés
- **API Routes** : Possibilité de créer un BFF (Backend for Frontend)
- **Optimisations** : Images, fonts, et bundles automatiquement optimisés
- **Deployment** : Déploiement simplifié sur Vercel

#### Shadcn/ui + Tailwind
- **Composants prêts** : DataTable, Forms, Charts, Modals
- **Design System** : Cohérence visuelle garantie
- **Accessibilité** : ARIA et navigation clavier intégrées
- **Customisation** : Variables CSS pour thèming facile
- **Performance** : CSS utilitaire avec purge automatique

### Bibliothèques Essentielles
```json
{
  "next": "^14.0.0",
  "@types/node": "^20.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.3.0",
  "@radix-ui/react-*": "Primitives UI",
  "class-variance-authority": "Variants composants",
  "clsx": "Classes conditionnelles",
  "tailwind-merge": "Merge classes Tailwind",
  "lucide-react": "Icônes cohérentes",
  "react-hook-form": "Gestion formulaires",
  "@hookform/resolvers": "Validation zod",
  "zod": "Schema validation",
  "axios": "HTTP client",
  "@tanstack/react-query": "Cache et sync données",
  "zustand": "State management",
  "react-leaflet": "Cartographie",
  "recharts": "Graphiques React-friendly",
  "date-fns": "Manipulation dates",
  "sonner": "Notifications toast"
}
```

### Structure Projet Next.js
```
src/
├── app/                    # App Router (Next.js 14+)
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx      # Layout dashboard
│   │   ├── page.tsx        # Dashboard home
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── zones/
│   │   └── settings/
│   ├── api/                # API Routes (BFF optionnel)
│   │   └── proxy/
│   ├── globals.css
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/             # Composants UI
│   ├── ui/                 # Shadcn/ui components
│   │   ├── button.tsx
│   │   ├── data-table.tsx
│   │   ├── form.tsx
│   │   └── ...
│   ├── forms/              # Forms métier
│   ├── charts/             # Graphiques
│   ├── maps/               # Composants carte
│   └── layout/             # Navigation, sidebar
├── lib/                    # Utilitaires
│   ├── utils.ts            # Helpers Tailwind
│   ├── validations.ts      # Schémas Zod
│   ├── api.ts              # Client API
│   └── store.ts            # Zustand store
├── hooks/                  # Custom hooks
├── types/                  # TypeScript definitions
└── constants/              # Configuration
```

### Avantages Spécifiques au Projet

#### Dashboard Professionnel
- **Shadcn/ui DataTable** : Parfait pour listes utilisateurs/zones
- **Composants Form** : Validation intégrée avec react-hook-form + zod
- **Layout responsive** : Mobile-first avec Tailwind breakpoints
- **Dark mode** : Intégré nativement avec Shadcn/ui

#### Performance
- **App Router** : Streaming, suspense, et loading states
- **Server Components** : Rendu côté serveur pour données statiques
- **Image optimization** : Lazy loading et formats modernes
- **Bundle splitting** : Chargement optimisé par route

#### Developer Experience
- **TypeScript strict** : Détection d'erreurs à la compilation
- **ESLint + Prettier** : Code quality intégrée
- **Hot reload** : Développement fluide
- **Storybook** : Documentation composants (optionnel)

### Configuration Tailwind Optimisée
```js
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        success: '#28a745',
        warning: '#ffc107', 
        error: '#dc3545',
        info: '#007bff',
        // Shadcn/ui color palette
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        // ...
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

---

## 📅 Roadmap de Développement

### Phase 1 : Fondations (2-3 semaines)
- [ ] Configuration projet + authentification
- [ ] Layout principal + navigation
- [ ] API client + gestion erreurs
- [ ] Pages utilisateurs de base

### Phase 2 : Fonctionnalités Core (3-4 semaines)
- [ ] Gestion complète utilisateurs
- [ ] Interface zones géographiques
- [ ] Système d'affectations
- [ ] Formulaires paramètres qualité

### Phase 3 : Dashboard & Visualisations (2-3 semaines)
- [ ] Tableaux de bord par rôle
- [ ] Graphiques et statistiques
- [ ] Intégration cartographique
- [ ] Notifications temps réel

### Phase 4 : Optimisation & Polish (1-2 semaines)
- [ ] Tests d'intégration
- [ ] Optimisations performance
- [ ] Documentation utilisateur
- [ ] Déploiement production

---

## ⚡ Points d'Attention Critiques

### Sécurité
- Validation côté frontend ET backend
- Sanitization des inputs utilisateur
- Gestion sécurisée des tokens JWT
- Protection contre les attaques XSS/CSRF

### Performance
- Pagination systématique (50 items/page max)
- Lazy loading des données volumineuses
- Cache intelligent des données statiques
- Optimisation images/assets

### Gestion d'Erreurs
- Messages d'erreur utilisateur-friendly
- Retry automatique requêtes réseau
- Fallbacks pour données manquantes
- Logs détaillés pour debugging

### Accessibilité
- Support clavier complet
- Attributs ARIA appropriés
- Contraste couleurs suffisant
- Textes alternatifs images

---

## 🧪 Tests & Qualité

### Tests Recommandés
- **Unit tests** : Composants isolés
- **Integration tests** : Flux utilisateur complets
- **API tests** : Intégration backend
- **E2E tests** : Parcours métier critiques

### Outils Qualité
```json
{
  "eslint": "Linting code",
  "prettier": "Formatage",
  "jest": "Tests unitaires", 
  "testing-library": "Tests composants",
  "cypress": "Tests E2E"
}
```

---

## 📚 Ressources Backend

### Données de Test
- **Admin par défaut** : `admin` / `admin123`
- **Base de données** : PostgreSQL sur port 5436
- **Swagger UI** : Documentation interactive complète

### Scripts Utiles
```bash
# Démarrage environnement
./scripts/docker.sh start    # PostgreSQL
./scripts/start.sh          # API FastAPI

# Interface admin BDD
./scripts/docker.sh pgadmin  # http://localhost:5050
```

### Types TypeScript Générables
Le backend utilise Pydantic - possibilité de générer automatiquement les types TypeScript depuis les schémas API avec `openapi-typescript-codegen`.

---

**🎯 Objectif Final :** Dashboard professionnel permettant le pilotage en temps réel d'enquêtes terrain avec contrôle qualité automatisé et visualisations métier adaptées à chaque niveau hiérarchique.