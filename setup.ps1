# Script PowerShell de demarrage pour Co-Garden

Write-Host "Co-Garden - Installation et demarrage" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Verifier Node.js
try {
    $nodeVersion = node -v
    Write-Host "[OK] Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Node.js n'est pas installe. Veuillez installer Node.js >= 18" -ForegroundColor Red
    exit 1
}

# Verifier Docker
try {
    docker --version | Out-Null
    Write-Host "[OK] Docker installe" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Docker n'est pas installe. Veuillez installer Docker Desktop" -ForegroundColor Red
    exit 1
}

# Installer les dependances racine
Write-Host ""
Write-Host "[1/6] Installation des dependances racine..." -ForegroundColor Cyan
npm install

# Installer les dependances des services
Write-Host ""
Write-Host "[2/6] Installation des dependances - Service Membres..." -ForegroundColor Cyan
Set-Location services\membres
npm install
Set-Location ..\..

Write-Host "[3/6] Installation des dependances - Service Parcelles..." -ForegroundColor Cyan
Set-Location services\parcelles
npm install
Set-Location ..\..

Write-Host "[4/6] Installation des dependances - Service Taches..." -ForegroundColor Cyan
Set-Location services\taches
npm install
Set-Location ..\..

Write-Host "[5/6] Installation des dependances - Service Catalogue..." -ForegroundColor Cyan
Set-Location services\catalogue
npm install
Set-Location ..\..

Write-Host "[6/6] Installation des dependances - Frontend..." -ForegroundColor Cyan
Set-Location app\frontend
npm install
Set-Location ..\..

# Demarrer les bases de donnees Docker
Write-Host ""
Write-Host "Demarrage des bases de donnees PostgreSQL..." -ForegroundColor Cyan
docker-compose up -d

# Attendre que les bases soient pretes
Write-Host "Attente du demarrage des bases de donnees (10 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "[SUCCES] Installation terminee !" -ForegroundColor Green
Write-Host ""
Write-Host "Pour demarrer tous les services, executez:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Documentation Swagger disponible sur:" -ForegroundColor Cyan
Write-Host "   - Service Membres:   http://localhost:3001/api-docs" -ForegroundColor White
Write-Host "   - Service Parcelles: http://localhost:3002/api-docs" -ForegroundColor White
Write-Host "   - Service Taches:    http://localhost:3003/api-docs" -ForegroundColor White
Write-Host "   - Service Catalogue: http://localhost:3004/api-docs" -ForegroundColor White
Write-Host ""
Write-Host "Frontend disponible sur:" -ForegroundColor Cyan
Write-Host "   http://localhost:5173" -ForegroundColor White
