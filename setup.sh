#!/bin/bash

# Script de démarrage pour Co-Garden
# Ce script installe les dépendances et démarre tous les services

echo "🌱 Co-Garden - Installation et démarrage"
echo "========================================"

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js >= 18"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker"
    exit 1
fi

echo "✅ Docker installé"

# Installer les dépendances racine
echo ""
echo "📦 Installation des dépendances racine..."
npm install

# Installer les dépendances des services
echo ""
echo "📦 Installation des dépendances - Service Membres..."
cd services/membres && npm install && cd ../..

echo "📦 Installation des dépendances - Service Parcelles..."
cd services/parcelles && npm install && cd ../..

echo "📦 Installation des dépendances - Service Tâches..."
cd services/taches && npm install && cd ../..

echo "📦 Installation des dépendances - Service Catalogue..."
cd services/catalogue && npm install && cd ../..

echo "📦 Installation des dépendances - Frontend..."
cd app/frontend && npm install && cd ../..

# Démarrer les bases de données Docker
echo ""
echo "🐳 Démarrage des bases de données PostgreSQL..."
docker-compose up -d

# Attendre que les bases soient prêtes
echo "⏳ Attente du démarrage des bases de données (10 secondes)..."
sleep 10

echo ""
echo "✅ Installation terminée !"
echo ""
echo "🚀 Pour démarrer tous les services, exécutez:"
echo "   npm run dev"
echo ""
echo "📚 Documentation Swagger disponible sur:"
echo "   - Service Membres:   http://localhost:3001/api-docs"
echo "   - Service Parcelles: http://localhost:3002/api-docs"
echo "   - Service Tâches:    http://localhost:3003/api-docs"
echo "   - Service Catalogue: http://localhost:3004/api-docs"
echo ""
echo "🌐 Frontend disponible sur:"
echo "   http://localhost:5173"
