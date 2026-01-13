src/
├── app/                           # 1. ROUTING (URL)
│   ├── (auth)/                    # Groupe de routes (layout spécifique sans sidebar)
│   │   └── login/
│   │       └── page.tsx           # Page de connexion
│   │
│   ├── (dashboard)/               # Groupe de routes protégé (avec Sidebar + Header)
│   │   ├── layout.tsx             # Layout principal (AuthGuard + Sidebar)
│   │   ├── page.tsx               # Dashboard (Accueil)
│   │   ├── users/                 # URL: /users
│   │   │   └── page.tsx
│   │   ├── maps/                  # URL: /maps (Zones & Affectations)
│   │   │   └── page.tsx
│   │   ├── dictionary/            # URL: /dictionary
│   │   │   └── page.tsx
│   │   └── settings/              # URL: /settings
│   │       └── page.tsx
│   │
│   ├── layout.tsx                 # Root Layout (Providers: React Query, Toaster)
│   └── globals.css                # Tailwind base styles
│
├── components/                    # 2. COMPOSANTS PARTAGÉS
│   ├── ui/                        # Shadcn UI (Button, Input, Card, Dialog...)
│   ├── layout/                    # Sidebar, Header, UserNav
│   └── common/                    # Composants génériques (ex: DataTable, PageHeader)
│
├── features/                      # 3. LOGIQUE MÉTIER (Le cœur du réacteur)
│   ├── auth/
│   │   ├── components/            # LoginForm.tsx
│   │   └── api/                   # login.ts, logout.ts
│   │
│   ├── users/
│   │   ├── api/                   # get-users.ts, create-user.ts, update-user.ts
│   │   └── components/            # UserList.tsx, CreateUserDialog.tsx, UserRoleBadge.tsx
│   │
│   ├── maps/                      # Correspond à "Maps & Quotas"
│   │   ├── api/                   # get-zones.ts, create-affectation.ts
│   │   └── components/            # ZoneMap.tsx, AffectationTable.tsx, QuotaConfigForm.tsx
│   │
│   ├── dictionary/                # Correspond à "Dictionary"
│   │   ├── api/                   # get-variables.ts
│   │   └── components/            # VariableList.tsx, ModaliteManager.tsx
│   │
│   └── settings/                  # Correspond à "Global Settings"
│       ├── api/                   # get-settings.ts, update-settings.ts
│       └── components/            # GlobalConfigForm.tsx (GPS, Horaires...)
│
├── lib/                           # 4. CONFIGURATION & OUTILS
│   ├── api-client.ts              # Ton instance Axios configurée (voir conversation précédente)
│   ├── react-query-provider.tsx   # Configuration du QueryClient
│   ├── utils.ts                   # Helpers (clsx, tailwind-merge)
│   └── constants.ts               # Constantes globales (ex: Roles)
│
├── types/                         # 5. DÉFINITIONS TYPESCRIPT
│   └── api-schema.ts              # Le fichier généré depuis ton OpenAPI
│
└── middleware.ts                  # 6. SÉCURITÉ (Protection des routes via Cookie)
