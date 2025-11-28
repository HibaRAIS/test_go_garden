# Guide de Démarrage Rapide - Co-Garden

## Prérequis

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Docker Desktop** (pour les bases de données PostgreSQL)

## Installation Automatique

### Sur Windows (PowerShell)

```powershell
.\setup.ps1
```

### Sur Linux/Mac

```bash
chmod +x setup.sh
./setup.sh
```

## Installation Manuelle

### 1. Installer les dépendances

```bash
# Dépendances racine
npm install

# Service Membres
cd services/membres && npm install && cd ../..

# Service Parcelles
cd services/parcelles && npm install && cd ../..

# Service Tâches
cd services/taches && npm install && cd ../..

# Service Catalogue
cd services/catalogue && npm install && cd ../..

# Frontend
cd app/frontend && npm install && cd ../..
```

### 2. Démarrer les bases de données

```bash
docker-compose up -d
```

Attendez environ 10 secondes que les bases de données soient prêtes.

### 3. Démarrer tous les services

```bash
npm run dev
```

Cette commande démarre simultanément :
- Les 4 microservices backend (ports 3001-3004)
- Le frontend React (port 5173)

## Accès aux Services

### Frontend
- **URL**: http://localhost:5173
- **Page de connexion**: http://localhost:5173/login
- **Inscription**: http://localhost:5173/register

### Documentation API (Swagger)
- **Service Membres**: http://localhost:3001/api-docs
- **Service Parcelles**: http://localhost:3002/api-docs
- **Service Tâches**: http://localhost:3003/api-docs
- **Service Catalogue**: http://localhost:3004/api-docs

### Health Checks
- http://localhost:3001/health
- http://localhost:3002/health
- http://localhost:3003/health
- http://localhost:3004/health

## Premier Démarrage

### 1. Créer un compte
Allez sur http://localhost:5173/register et créez votre premier utilisateur.

### 2. Explorer le Dashboard
Une fois connecté, vous verrez votre tableau de bord qui agrège vos parcelles, tâches et commentaires.

### 3. Ajouter des données via Swagger
Pour tester l'architecture mesh, utilisez Swagger pour créer :
- Des parcelles (Service Parcelles)
- Des tâches (Service Tâches)
- Des commentaires sur les plantes (Service Catalogue)

## Commandes Utiles

```bash
# Démarrer tous les services
npm run dev

# Démarrer un service spécifique
npm run dev:membres
npm run dev:parcelles
npm run dev:taches
npm run dev:catalogue
npm run dev:frontend

# Docker
npm run docker:up          # Démarrer les BDD
npm run docker:down        # Arrêter les BDD
npm run docker:reset       # Réinitialiser les BDD
```

## Arrêter les Services

1. Arrêter les services (Ctrl+C dans le terminal)
2. Arrêter les bases de données :

```bash
npm run docker:down
```

## Réinitialiser les Bases de Données

Pour repartir de zéro :

```bash
npm run docker:reset
```

Puis redémarrer les services avec `npm run dev`.

## Problèmes Courants

### Les bases de données ne démarrent pas
- Vérifiez que Docker Desktop est lancé
- Vérifiez que les ports 5432-5435 sont disponibles

### Erreurs de connexion entre services
- Vérifiez que tous les services sont démarrés
- Vérifiez les URLs dans les fichiers `.env` de chaque service

### Erreurs d'authentification
- Assurez-vous d'avoir créé un compte via /register
- Le token JWT est stocké dans localStorage

## Architecture Mesh - Endpoints Importants

Chaque service possède un endpoint "mesh" qui agrège des données des 3 autres :

1. **Service Membres**: `GET /api/profile/dashboard/{member_id}`
   - Agrège : parcelles, tâches, commentaires

2. **Service Parcelles**: `GET /api/plots/{id}/details`
   - Agrège : propriétaire (membres), tâches, plante (catalogue)

3. **Service Tâches**: `GET /api/tasks/{id}/context`
   - Agrège : assignés (membres), parcelle, plante (catalogue)

4. **Service Catalogue**: `GET /api/plants/{id}/report`
   - Agrège : auteurs (membres), parcelles, tâches

## Support

Pour toute question, consultez le README principal ou la documentation Swagger de chaque service.
