# Architecture Technique - Co-Garden

## Vue d'Ensemble

Co-Garden est une application web collaborative de jardinage basée sur une **architecture microservices mesh** (maillée). Chaque service est autonome mais consomme des données des autres services pour fournir des vues agrégées riches.

## Architecture Mesh

### Principe

Dans une architecture mesh traditionnelle, les services communiquent entre eux de manière décentralisée. Dans Co-Garden :

- **4 microservices indépendants** (Membres, Parcelles, Tâches, Catalogue)
- **Chaque service possède sa propre base de données PostgreSQL**
- **Chaque service expose un endpoint "mesh"** qui agrège des données des 3 autres
- **Communication HTTP/REST** entre services (via axios)

### Diagramme de Communication

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                    │
│                    Port: 5173                           │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   MEMBRES    │◄──►│  PARCELLES   │◄──►│   TÂCHES     │
│  Port: 3001  │    │  Port: 3002  │    │  Port: 3003  │
│  DB: 5432    │    │  DB: 5433    │    │  DB: 5434    │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           ▼
                   ┌──────────────┐
                   │  CATALOGUE   │
                   │  Port: 3004  │
                   │  DB: 5435    │
                   └──────────────┘
```

## Services Détaillés

### 1. Service Membres (Profil 360)

**Port**: 3001  
**Base de données**: membres_db (port 5432)

#### Responsabilités
- Authentification (register/login avec JWT)
- Gestion des profils utilisateurs
- Endpoint mesh : Dashboard utilisateur agrégé

#### Schéma Base de Données
```sql
users (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  created_at TIMESTAMP
)
```

#### Endpoints Principaux
- `POST /auth/register` - Créer un compte
- `POST /auth/login` - Se connecter (retourne JWT)
- `GET /api/members/{id}` - Infos membre (consommé par les autres)
- `GET /api/members?ids=x,y,z` - Infos membres multiples
- **🔥 MESH**: `GET /api/profile/dashboard/{member_id}`

#### Endpoint Mesh - Dashboard
Agrège :
- **Service Parcelles** : `GET /api/plots?member_id={id}`
- **Service Tâches** : `GET /api/tasks?assigned_to={id}`
- **Service Catalogue** : `GET /api/comments?author_id={id}`

Retourne :
```json
{
  "user": { ... },
  "plots": [...],
  "tasks": [...],
  "comments": [...]
}
```

---

### 2. Service Parcelles (Dashboard Parcelle)

**Port**: 3002  
**Base de données**: parcelles_db (port 5433)

#### Responsabilités
- Gestion des parcelles de terrain
- Endpoint mesh : Vue détaillée parcelle

#### Schéma Base de Données
```sql
plots (
  id UUID PRIMARY KEY,
  name TEXT,
  location_ref TEXT,
  size_sqm INTEGER,
  current_plant_id UUID,
  member_id UUID,
  created_at TIMESTAMP
)
```

#### Endpoints Principaux
- `GET /api/plots` - Toutes les parcelles
- `POST /api/plots` - Créer une parcelle
- `GET /api/plots?member_id={id}` - Parcelles d'un membre
- `GET /api/plots?plant_id={id}` - Parcelles cultivant une plante
- **🔥 MESH**: `GET /api/plots/{id}/details`

#### Endpoint Mesh - Détails Parcelle
Agrège :
- **Service Membres** : `GET /api/members/{member_id}`
- **Service Tâches** : `GET /api/tasks?plot_id={id}`
- **Service Catalogue** : `GET /api/plants/{current_plant_id}`

---

### 3. Service Tâches (Contexte Tâche)

**Port**: 3003  
**Base de données**: taches_db (port 5434)

#### Responsabilités
- Gestion des tâches collectives et individuelles
- Assignations de membres aux tâches
- Endpoint mesh : Vue contextuelle tâche

#### Schéma Base de Données
```sql
tasks (
  id UUID PRIMARY KEY,
  title TEXT,
  description TEXT,
  due_date TIMESTAMP,
  plot_id UUID,
  plant_id UUID,
  created_at TIMESTAMP
)

task_assignments (
  id SERIAL PRIMARY KEY,
  task_id UUID REFERENCES tasks,
  member_id UUID,
  UNIQUE(task_id, member_id)
)
```

#### Endpoints Principaux
- `GET /api/tasks` - Toutes les tâches
- `POST /api/tasks` - Créer une tâche
- `GET /api/tasks?assigned_to={id}` - Tâches d'un membre
- `GET /api/tasks?plot_id={id}` - Tâches d'une parcelle
- `GET /api/tasks?plant_id={id}` - Tâches d'une plante
- **🔥 MESH**: `GET /api/tasks/{id}/context`

#### Endpoint Mesh - Contexte Tâche
Agrège :
- **Service Membres** : `GET /api/members?ids=x,y,z` (assignés)
- **Service Parcelles** : `GET /api/plots/{plot_id}`
- **Service Catalogue** : `GET /api/plants/{plant_id}`

---

### 4. Service Catalogue (Rapport Plante)

**Port**: 3004  
**Base de données**: catalogue_db (port 5435)

#### Responsabilités
- Base de connaissances (Wiki) sur les plantes
- Gestion des commentaires sur les plantes
- Endpoint mesh : Rapport complet plante

#### Schéma Base de Données
```sql
plants (
  id UUID PRIMARY KEY,
  name TEXT,
  scientific_name TEXT,
  description TEXT,
  planting_season TEXT,
  created_at TIMESTAMP
)

comments (
  id UUID PRIMARY KEY,
  text TEXT,
  plant_id UUID REFERENCES plants,
  author_id UUID,
  created_at TIMESTAMP
)
```

#### Endpoints Principaux
- `GET /api/plants` - Toutes les plantes
- `POST /api/plants` - Créer une plante
- `GET /api/plants/{id}` - Détails plante (consommé par les autres)
- `POST /api/plants/{id}/comments` - Ajouter un commentaire
- `GET /api/comments?author_id={id}` - Commentaires d'un membre
- **🔥 MESH**: `GET /api/plants/{id}/report`

#### Endpoint Mesh - Rapport Plante
Agrège :
- **Service Membres** : `GET /api/members?ids=x,y,z` (auteurs commentaires)
- **Service Parcelles** : `GET /api/plots?plant_id={id}`
- **Service Tâches** : `GET /api/tasks?plant_id={id}`

---

## Frontend (React + Tailwind)

**Port**: 5173  
**Framework**: React 18 + Vite  
**Styling**: Tailwind CSS 3

### Stack Technique
- **Routing**: React Router v6
- **State Management**: Zustand (auth)
- **Data Fetching**: React Query (TanStack Query)
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Pages Principales

1. **Login/Register** - Authentification
2. **Dashboard** - Vue 360° de l'utilisateur (endpoint mesh du Service Membres)
3. **Parcelles** - Liste et détails des parcelles (endpoint mesh)
4. **Catalogue** - Wiki des plantes avec rapports complets (endpoint mesh)
5. **Tâches** - Liste des tâches

### Design System

Composants réutilisables définis dans `index.css` :
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`
- `.card`
- `.input`, `.label`
- `.skeleton`

Couleurs principales :
- Primary (vert) : `primary-50` à `primary-900`
- Grays : `gray-50` à `gray-900`

### Mobile-First
- Breakpoints Tailwind : `sm`, `md`, `lg`, `xl`
- Navigation responsive
- Grilles adaptatives

---

## Sécurité

### Authentification JWT
- **Génération** : Service Membres (`/auth/login`, `/auth/register`)
- **Stockage** : localStorage (frontend)
- **Validation** : Middleware `authMiddleware` (backend)
- **Transmission** : Header `Authorization: Bearer <token>`

### CORS
Tous les services backend activent CORS pour permettre les requêtes du frontend (port 5173).

---

## Déploiement

### Développement Local
```bash
npm run docker:up  # Bases de données
npm run dev        # Tous les services
```

### Production (Proposition)

#### Option 1: Docker Compose Complet
Créer un `docker-compose.prod.yml` avec :
- 4 services backend (Node.js)
- 4 bases PostgreSQL
- 1 frontend (Nginx servant le build Vite)

#### Option 2: Cloud (Railway, Render, etc.)
- Déployer chaque service individuellement
- Utiliser PostgreSQL managé
- Variables d'environnement pour les URLs inter-services

---

## Monitoring & Logging

### Health Checks
Chaque service expose un endpoint `/health` :
```json
{
  "status": "ok",
  "service": "membres",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Logs
- Console logs pour chaque requête/erreur
- Swagger UI pour tester les endpoints
- React Query DevTools (frontend)

---

## Évolutions Futures

1. **Message Queue** (RabbitMQ, Kafka) pour communication asynchrone
2. **API Gateway** pour centraliser l'authentification
3. **Service Mesh** (Istio, Linkerd) pour production
4. **GraphQL** pour optimiser les requêtes agrégées
5. **WebSockets** pour notifications temps réel
6. **Tests** (Jest, Cypress)
7. **CI/CD** (GitHub Actions)

---

## Conclusion

Cette architecture mesh offre :
- ✅ **Scalabilité** : Chaque service peut être déployé indépendamment
- ✅ **Résilience** : Gestion gracieuse des erreurs (Promise.allSettled)
- ✅ **Flexibilité** : Facile d'ajouter de nouveaux services
- ✅ **Maintenabilité** : Code organisé, documenté (Swagger)
- ✅ **Performance** : Appels parallèles (Promise.all)

L'architecture démontre parfaitement le concept de microservices maillés où chaque service enrichit les autres.
