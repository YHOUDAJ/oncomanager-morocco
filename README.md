# OncoManager Morocco 🏥

Application SaaS de gestion de cabinet d'oncologie pour le marché marocain.

## Stack Technique

- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript
- **Backend**: API Routes Next.js
- **Base de données**: PostgreSQL + Prisma ORM
- **UI**: Tailwind CSS
- **Validation**: Zod
- **State Management**: React Query (TanStack Query)
- **Formulaires**: React Hook Form

## Prérequis

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/YHOUDAJ/oncomanager-morocco.git
cd oncomanager-morocco
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer la base de données

Copier le fichier d'environnement :

```bash
cp .env.example .env.local
```

Modifier `.env.local` avec vos paramètres PostgreSQL :

```
DATABASE_URL="postgresql://user:password@localhost:5432/oncomanager?schema=public"
```

### 4. Initialiser la base de données

```bash
# Générer le client Prisma
npm run db:generate

# Créer les tables
npm run db:push

# (Optionnel) Ouvrir Prisma Studio pour visualiser les données
npm run db:studio
```

### 5. Lancer le serveur de développement

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000)

## Structure du Projet

```
oncomanager-morocco/
├── app/
│   ├── api/
│   │   └── patients/
│   │       ├── route.ts          # GET (liste), POST (création)
│   │       └── [id]/
│   │           └── route.ts      # GET, PUT, DELETE
│   └── patients/
│       ├── page.tsx              # Liste des patients
│       ├── nouveau/
│       │   └── page.tsx          # Formulaire création
│       └── [id]/
│           └── page.tsx          # Fiche patient
├── components/
│   └── patients/
│       ├── PatientTable.tsx
│       ├── PatientForm.tsx
│       ├── PatientSearch.tsx
│       └── DeletePatientDialog.tsx
├── hooks/
│   └── usePatients.ts            # React Query hooks
├── lib/
│   ├── prisma.ts                 # Client Prisma singleton
│   └── validations/
│       └── patient.ts            # Schémas Zod
├── prisma/
│   └── schema.prisma             # Modèle de données
├── types/
│   └── index.ts                  # Types TypeScript
└── package.json
```

## API Endpoints

### Patients

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/patients` | Liste paginée avec filtres |
| POST | `/api/patients` | Création d'un patient |
| GET | `/api/patients/[id]` | Détail d'un patient |
| PUT | `/api/patients/[id]` | Modification |
| DELETE | `/api/patients/[id]` | Archivage (soft delete) |

### Paramètres de requête (GET /api/patients)

| Paramètre | Type | Description |
|-----------|------|-------------|
| `q` | string | Recherche (nom, prénom, CIN, téléphone) |
| `sexe` | HOMME \| FEMME | Filtrer par sexe |
| `ville` | string | Filtrer par ville |
| `avecDiagnostic` | boolean | Avec/sans diagnostic |
| `page` | number | Numéro de page (défaut: 1) |
| `limit` | number | Résultats par page (défaut: 20) |
| `sortBy` | string | Champ de tri |
| `sortOrder` | asc \| desc | Ordre de tri |

## Roadmap

- [x] Module Patients (CRUD)
- [ ] Module Rendez-vous
- [ ] Module Consultations
- [ ] Module Protocoles & Cures
- [ ] Module Facturation
- [ ] Module Documents
- [ ] Authentification (NextAuth)
- [ ] Gestion des rôles (Médecin, Secrétaire, Infirmier)
- [ ] Intégration WhatsApp (rappels RDV)
- [ ] Intégration laboratoires
- [ ] Export PDF / Excel
- [ ] Tableaux de bord & statistiques

## Licence

Propriétaire - Tous droits réservés
