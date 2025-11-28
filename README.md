# 🌱 Co-Garden Catalogue - Gestion de Plantes

Application complète de gestion de catalogue de plantes pour jardins communautaires, avec backend API et frontend moderne.

![Status](https://img.shields.io/badge/Status-En%20développement-yellow)
![Node](https://img.shields.io/badge/Node-v18+-green)
![React](https://img.shields.io/badge/React-18.3-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)

## 📋 Table des matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Installation rapide](#installation-rapide)
- [Architecture](#architecture)
- [Documentation](#documentation)
- [Captures d'écran](#captures-décran)

---

## 🎯 Aperçu

Co-Garden Catalogue est une plateforme web permettant de gérer et consulter un catalogue de plantes pour jardins communautaires. Le projet comprend :

- **Backend API REST** avec Node.js, Express et Prisma
- **Frontend moderne** avec React, TypeScript et Tailwind CSS
- **Base de données** PostgreSQL
- **Design responsive** adapté mobile/tablet/desktop

### ✨ Fonctionnalités

#### Pour tous les utilisateurs
- 📖 **Catalogue de plantes** - Consultation avec recherche et filtres
- 🔍 **Recherche intelligente** - Par nom, type, description
- 📱 **Design responsive** - Adapté à tous les écrans
- 🖼️ **Galerie d'images** - Avec fallback automatique
- 💬 **Commentaires** - Partage de conseils entre jardiniers
- 📊 **Informations détaillées** - Description, entretien, saison

#### Pour les membres/utilisateurs
- ✅ **Lecture** de toutes les plantes
- ✅ **Ajout de commentaires** sur les plantes
- ✅ **Suppression** de leurs propres commentaires
- ❌ **Pas d'accès** aux opérations CRUD sur les plantes

#### Pour les administrateurs
- ➕ **CRUD complet** - Créer, lire, modifier, supprimer des plantes
- 🛡️ **Panel d'administration** - Interface graphique dédiée
- 📝 **Modération totale** - Gestion de tous les commentaires
- 🔐 **Authentification JWT** - Sécurisée et sans état
- 📚 **API Swagger** - Documentation interactive complète

---

## 🛠️ Technologies

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **ORM**: Prisma
- **Base de données**: PostgreSQL
- **Validation**: Express Validator
- **Auth**: JWT (JSON Web Tokens)
- **Sécurité**: bcrypt, CORS

### Frontend
- **Framework**: React 18.3
- **Langage**: TypeScript
- **Build tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Routing**: React Router DOM

---

## 🚀 Installation rapide

### Prérequis
- Node.js v18 ou supérieur
- PostgreSQL v14 ou supérieur
- npm ou yarn

### 1. Configuration de la base de données

```sql
CREATE DATABASE cogarden_catalogue;
CREATE USER cogarden_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE cogarden_catalogue TO cogarden_user;
```

### 2. Installation Backend

```powershell
cd catalogue-service

# Installer les dépendances
npm install

# Configurer l'environnement
copy .env.example .env
# Éditer .env avec vos informations

# Initialiser la base de données
npm run prisma:generate
npm run prisma:push

# (Optionnel) Ajouter des données de test
npm run prisma:seed

# Démarrer le serveur
npm run dev
```

✅ Backend disponible sur **http://127.0.0.1:8002**

### 3. Installation Frontend

```powershell
cd frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

✅ Frontend disponible sur **http://localhost:5173**

### 4. Tester l'installation

Ouvrir http://localhost:5173 et naviguer vers:
- **Galerie** → Catalogue complet des plantes
- **Plantes** → Vue détaillée avec recherche

---

## 📐 Architecture

```
Co-Garden Catalogue/
├── catalogue-service/              # Backend API
│   ├── src/
│   │   ├── app.js                 # Configuration Express
│   │   ├── server.js              # Point d'entrée
│   │   ├── config/
│   │   │   └── prisma.js          # Configuration Prisma
│   │   ├── middleware/
│   │   │   └── auth.js            # Authentification JWT
│   │   ├── routes/
│   │   │   ├── auth.js            # Routes d'authentification
│   │   │   └── plants.js          # Routes des plantes
│   │   └── validators/            # Validation des données
│   ├── prisma/
│   │   └── schema.prisma          # Schéma de base de données
│   └── package.json
│
├── frontend/                       # Frontend React
│   ├── src/
│   │   ├── App.tsx               # Application principale
│   │   ├── main.tsx              # Point d'entrée
│   │   ├── pages/
│   │   │   ├── Gallery.tsx       # Page Galerie (Catalogue)
│   │   │   ├── Plants.tsx        # Page Plantes détaillée
│   │   │   ├── Dashboard.tsx     # Tableau de bord
│   │   │   └── ...               # Autres pages
│   │   ├── services/
│   │   │   └── api.ts            # Service API centralisé
│   │   ├── components/
│   │   │   ├── PlantCard.tsx    # Carte de plante
│   │   │   └── ui/               # Composants UI réutilisables
│   │   └── lib/
│   │       └── mock-data.ts      # Données de démo
│   └── package.json
│
└── docs/                           # Documentation
    ├── QUICKSTART.md              # Démarrage rapide
    ├── SETUP.md                   # Installation détaillée
    ├── INTEGRATION_GUIDE.md       # Guide technique
    └── CHANGELOG.md               # Journal des modifications
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](QUICKSTART.md) | 🚀 Démarrage ultra-rapide en 3 étapes |
| [SETUP.md](SETUP.md) | 📖 Installation complète et détaillée |
| [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) | 🔧 Guide technique d'intégration |
| [ADMIN_FEATURES.md](ADMIN_FEATURES.md) | 🛡️ Fonctionnalités admin et Swagger |
| [TEST_API.md](TEST_API.md) | 🧪 Tests et exemples de requêtes |
| [DESIGN_GUIDE.md](DESIGN_GUIDE.md) | 🎨 Guide de design système |
| [CHANGELOG.md](CHANGELOG.md) | 📝 Historique des modifications |

---

## 🔌 API Endpoints

### 📚 Documentation Swagger Interactive
**http://127.0.0.1:8002/api-docs** - Interface complète pour tester l'API

### Plants (Public + Admin)
```
GET    /api/plants              Liste des plantes (pagination) - Public
GET    /api/plants/search?q=    Recherche de plantes - Public
GET    /api/plants/:id          Détails d'une plante - Public
POST   /api/plants              Créer une plante - Admin uniquement 🔒
PUT    /api/plants/:id          Modifier une plante - Admin uniquement 🔒
DELETE /api/plants/:id          Supprimer une plante - Admin uniquement 🔒
```

### Comments (Members/Users)
```
POST   /api/plants/:id/comments              Ajouter un commentaire - Authentifié 🔒
DELETE /api/plants/:plantId/comments/:id     Supprimer un commentaire - Auteur/Admin 🔒
```

### Auth (Admin)
```
POST   /api/auth/register       Inscription admin
POST   /api/auth/login          Connexion admin
```

### Permissions
- 🌐 **Public** - Lecture des plantes
- 🔐 **Member/User** - Lecture + Commentaires
- 🛡️ **Admin** - Tout (CRUD plantes + modération)

---

## 🎨 Pages et Interfaces

### Swagger API Documentation
- **URL**: http://127.0.0.1:8002/api-docs
- Interface interactive pour tester l'API
- Schémas de données détaillés
- Exemples de requêtes/réponses

### Panel Admin
- **URL**: http://localhost:5173/admin/plants (après login)
- Table CRUD complète pour les plantes
- Formulaires Create/Update avec validation
- Dialogue de confirmation pour Delete
- Messages de succès/erreur en temps réel

### Galerie (Catalogue) - User
- **URL**: http://localhost:5173/gallery
- Grille responsive de plantes
- Recherche en temps réel
- Modal de détails complets
- Images avec fallback automatique

### Plants (Vue détaillée) - User
- **URL**: http://localhost:5173/plants
- Liste complète avec filtres
- Informations d'entretien
- Section commentaires
- Formulaire d'ajout de conseils

---

## 🔧 Scripts disponibles

### Backend
```powershell
npm run dev              # Mode développement avec hot-reload
npm start                # Mode production
npm run prisma:generate  # Générer le client Prisma
npm run prisma:push      # Pousser le schéma vers la DB
npm run prisma:studio    # Interface graphique de la DB
npm run prisma:seed      # Peupler avec des données de test
```

### Frontend
```powershell
npm run dev              # Mode développement
npm run build            # Build pour production
npm run preview          # Prévisualiser le build
```

---

## 🌟 Fonctionnalités à venir

- [ ] Upload d'images pour les plantes (actuellement URL uniquement)
- [ ] Système de favoris pour les utilisateurs
- [ ] Filtres avancés (type, saison, difficulté)
- [ ] Notifications en temps réel
- [ ] Dashboard admin avec statistiques
- [ ] Gestion des utilisateurs dans le panel admin
- [ ] Export de données (CSV/JSON)
- [ ] Mode sombre
- [ ] Application mobile (PWA)
- [ ] Multilingue (i18n)
- [ ] Historique des modifications

---

## 🐛 Dépannage

### Problème de connexion au backend
```powershell
# Vérifier que le backend est démarré
curl http://127.0.0.1:8002/health

# Vérifier le fichier .env du frontend
# VITE_API_URL=http://127.0.0.1:8002/api
```

### Erreur de base de données
```powershell
# Vérifier PostgreSQL
services.msc  # Rechercher PostgreSQL

# Tester la connexion
psql -U cogarden_user -d cogarden_catalogue
```

### Erreurs TypeScript
```powershell
cd frontend
npm install
```

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 Licence

Ce projet est sous licence MIT.

---

## 👥 Équipe

Développé avec ❤️ pour Co-Garden

---

## 📞 Support

Pour toute question ou problème :
- 📖 Consulter la [documentation](SETUP.md)
- 🐛 Ouvrir une issue sur GitHub
- 📧 Contacter l'équipe

---

**Bonne culture ! 🌱**
