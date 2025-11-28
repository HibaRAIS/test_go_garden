# 🗄️ Structure de la Base de Données Unifiée - co_garden

## 📊 Vue d'ensemble

**Nom de la base:** `co_garden`  
**Tables:** 3 tables principales  
**Utilisateur DB:** `postgres`  
**Mot de passe:** `123456`  
**Port:** `5432`

---

## 📋 Tables

### 1️⃣ **Table: members** (6 lignes)

**Description:** Gestion de tous les membres (administrateurs et membres réguliers)

| Colonne | Type | Description | Contraintes |
|---------|------|-------------|-------------|
| `id` | SERIAL | Identifiant unique | PRIMARY KEY |
| `first_name` | VARCHAR(50) | Prénom du membre | NOT NULL |
| `last_name` | VARCHAR(50) | Nom du membre | NOT NULL |
| `email` | VARCHAR(100) | Email unique | UNIQUE, NOT NULL |
| `phone` | VARCHAR(20) | Numéro de téléphone | NULL |
| `password_hash` | VARCHAR(255) | Mot de passe hashé (bcrypt) | NOT NULL |
| `role` | VARCHAR(10) | Rôle: 'admin' ou 'membre' | DEFAULT 'membre' |
| `join_date` | TIMESTAMP | Date d'inscription | DEFAULT NOW() |
| `skills` | TEXT | Compétences en jardinage | NULL |
| `createdAt` | TIMESTAMP | Date de création | DEFAULT NOW() |
| `updatedAt` | TIMESTAMP | Date de modification | DEFAULT NOW() |

**Indexes:**
- `idx_members_email` sur `email`
- `idx_members_role` sur `role`

**Données actuelles:**
```
ID | Prénom  | Nom       | Email                         | Rôle   | Téléphone  | Compétences
---|---------|-----------|-------------------------------|--------|------------|---------------------------
1  | Admin   | Principal | admin@co-garden.fr            | admin  | -          | -
3  | Emma    | Laurent   | emma.laurent@co-garden.fr     | membre | 0144778899 | jardinage en pot, plantes d'intérieur
4  | Thomas  | Simon     | thomas.simon@co-garden.fr     | membre | 0622334455 | arboriculture, verger
5  | Camille | Michel    | camille.michel@co-garden.fr   | membre | 0755667788 | jardinage pédagogique, animation
6  | Nicolas | Lefebvre  | nicolas.lefebvre@co-garden.fr | membre | 0188996655 | bricolage, construction de bacs
7  | Sarah   | Garcia    | sarah.garcia@co-garden.fr     | membre | 0699554433 | plantes grimpantes, rosiers
```

**Mots de passe:**
- Admin: `admin123`
- Autres membres: `password`

---

### 2️⃣ **Table: plants** (10 lignes)

**Description:** Catalogue des plantes du jardin communautaire

| Colonne | Type | Description | Contraintes |
|---------|------|-------------|-------------|
| `id` | SERIAL | Identifiant unique | PRIMARY KEY |
| `name` | VARCHAR(200) | Nom commun de la plante | NOT NULL |
| `scientific_name` | VARCHAR(300) | Nom scientifique (latin) | NULL |
| `type` | VARCHAR(100) | Type (Légume, Fruit, Herbe...) | NULL |
| `description` | TEXT | Description de la plante | NULL |
| `care_instructions` | TEXT | Instructions d'entretien | NULL |
| `image_url` | VARCHAR(500) | URL de l'image | NULL |
| `created_at` | TIMESTAMP | Date de création | DEFAULT NOW() |

**Indexes:**
- `idx_plants_name` sur `name`
- `idx_plants_type` sur `type`

**Exemples de plantes:**
- Tomate Cerise (Solanum lycopersicum) - Légume
- Basilic (Ocimum basilicum) - Herbe aromatique
- Fraisier (Fragaria × ananassa) - Fruit
- Laitue (Lactuca sativa) - Légume
- Menthe (Mentha) - Herbe aromatique

---

### 3️⃣ **Table: comments** (0 lignes actuellement)

**Description:** Commentaires des membres sur les plantes

| Colonne | Type | Description | Contraintes |
|---------|------|-------------|-------------|
| `id` | SERIAL | Identifiant unique | PRIMARY KEY |
| `plant_id` | INTEGER | ID de la plante | NOT NULL, FK → plants(id) |
| `user_id` | VARCHAR(100) | ID du membre (optionnel) | NULL |
| `author` | VARCHAR(200) | Nom de l'auteur | NOT NULL |
| `content` | TEXT | Contenu du commentaire | NOT NULL |
| `created_at` | TIMESTAMP | Date de création | DEFAULT NOW() |

**Indexes:**
- `idx_comments_plant_id` sur `plant_id`
- `idx_comments_user_id` sur `user_id`

**Foreign Keys:**
- `plant_id` → `plants(id)` ON DELETE CASCADE

---

## 🔗 Relations

```
members (6)
   └─ role = 'admin' ou 'membre'

plants (10)
   └─ comments (0..*)
        ├─ plant_id → plants.id
        └─ author (nom du membre)
```

---

## 📊 Vues SQL

### Vue: `admin_users`
Affiche uniquement les membres avec le rôle 'admin'

```sql
CREATE OR REPLACE VIEW admin_users AS
SELECT id, first_name, last_name, email, join_date
FROM members
WHERE role = 'admin';
```

### Vue: `plants_with_comments_count`
Affiche les plantes avec le nombre de commentaires

```sql
CREATE OR REPLACE VIEW plants_with_comments_count AS
SELECT 
    p.*,
    COUNT(c.id) as comments_count
FROM plants p
LEFT JOIN comments c ON p.id = c.plant_id
GROUP BY p.id;
```

---

## 🔧 Configuration des Services

### **service-membres** (port 8001)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=co_garden
DB_USER=postgres
DB_PASSWORD=123456
JWT_SECRET=votre_super_secret_jwt_très_long_et_compliqué
JWT_EXPIRES_IN=7d
PORT=8001
```

**Tables utilisées:** `members`

### **catalogue-service** (port 8002)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=co_garden
DB_USER=postgres
DB_PASSWORD=123456
DATABASE_URL=postgresql://postgres:123456@localhost:5432/co_garden
JWT_SECRET=co-garden-super-secret-key-change-in-production-2025
PORT=8002
```

**Tables utilisées:** `plants`, `comments`, `members` (lecture seule)

---

## 📝 Commandes SQL Utiles

### Voir tous les membres
```sql
SELECT id, first_name, last_name, email, role FROM members ORDER BY role DESC, id;
```

### Voir tous les admins
```sql
SELECT * FROM admin_users;
```

### Voir toutes les plantes avec leur nombre de commentaires
```sql
SELECT * FROM plants_with_comments_count ORDER BY name;
```

### Ajouter un nouveau membre
```sql
INSERT INTO members (first_name, last_name, email, password_hash, role)
VALUES ('Prénom', 'Nom', 'email@co-garden.fr', '$2b$10$hash...', 'membre');
```

### Promouvoir un membre en admin
```sql
UPDATE members SET role = 'admin' WHERE email = 'email@co-garden.fr';
```

### Rétrograder un admin en membre
```sql
UPDATE members SET role = 'membre' WHERE email = 'email@co-garden.fr';
```

### Voir les commentaires d'une plante
```sql
SELECT c.*, m.first_name, m.last_name
FROM comments c
LEFT JOIN members m ON CAST(c.user_id AS INTEGER) = m.id
WHERE c.plant_id = 1
ORDER BY c.created_at DESC;
```

---

## 🔒 Sécurité

### Mots de passe
- **Hashage:** bcrypt avec 10 salt rounds
- **Stockage:** Colonne `password_hash` (jamais le mot de passe en clair)
- **Validation:** Côté backend avec `bcrypt.compare()`

### Authentification
- **Méthode:** JWT (JSON Web Tokens)
- **Durée:** 7 jours
- **Payload:** `{ id, email, role }`
- **Secret:** Défini dans `.env` de chaque service

### Rôles
- **admin:** Peut gérer les plantes (CRUD), gérer les membres
- **membre:** Peut commenter les plantes, voir le catalogue

---

## 📦 Scripts de Maintenance

### Backup de la base
```powershell
$env:PGPASSWORD='123456'
pg_dump -U postgres -h localhost co_garden > backup_co_garden_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql
```

### Restaurer la base
```powershell
$env:PGPASSWORD='123456'
psql -U postgres -h localhost co_garden < backup_file.sql
```

### Réinitialiser la base
```powershell
$env:PGPASSWORD='123456'
psql -U postgres -h localhost -c "DROP DATABASE IF EXISTS co_garden;"
psql -U postgres -h localhost -c "CREATE DATABASE co_garden;"
psql -U postgres -h localhost -d co_garden -f migration-unified-database.sql
```

---

## ✅ Avantages de cette Structure

1. **🎯 Base unique:** Plus besoin de gérer deux bases séparées
2. **🔄 Synchronisation:** Les deux services utilisent les mêmes données
3. **👥 Gestion unifiée:** Un seul système de membres avec rôles
4. **🚀 Performance:** Moins de connexions, moins de redondance
5. **🛡️ Sécurité:** Gestion centralisée des accès
6. **📊 Simplicité:** Structure claire et facile à comprendre

---

## 📞 Connexion PostgreSQL

### Ligne de commande
```powershell
$env:PGPASSWORD='123456'
psql -U postgres -h localhost -d co_garden
```

### pgAdmin
- Host: `localhost`
- Port: `5432`
- Database: `co_garden`
- Username: `postgres`
- Password: `123456`

---

**Dernière mise à jour:** 30 octobre 2025  
**Version:** 2.0 (Base unifiée)  
**Statut:** ✅ Production Ready
