-- ============================================
-- SCRIPT DE MIGRATION - BASE DE DONNÉES UNIFIÉE
-- Database: co_garden
-- ============================================

-- Créer la base de données si elle n'existe pas
-- CREATE DATABASE co_garden;

-- Se connecter à la base co_garden
\c co_garden

-- ============================================
-- TABLE: members (depuis service-membres)
-- ============================================
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(10) DEFAULT 'membre' CHECK (role IN ('admin', 'membre')),
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    skills TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index sur email pour performance
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_role ON members(role);

-- ============================================
-- TABLE: plants (depuis catalogue-service)
-- ============================================
CREATE TABLE IF NOT EXISTS plants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    scientific_name VARCHAR(300),
    type VARCHAR(100),
    description TEXT,
    care_instructions TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index sur name pour recherche
CREATE INDEX IF NOT EXISTS idx_plants_name ON plants(name);
CREATE INDEX IF NOT EXISTS idx_plants_type ON plants(type);

-- ============================================
-- TABLE: comments (depuis catalogue-service)
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    plant_id INTEGER NOT NULL,
    user_id VARCHAR(100),
    author VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_plant
        FOREIGN KEY(plant_id) 
        REFERENCES plants(id)
        ON DELETE CASCADE
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_comments_plant_id ON comments(plant_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- ============================================
-- SUPPRESSION DE LA TABLE ADMINS (LEGACY)
-- Note: On utilise maintenant members.role='admin'
-- ============================================
DROP TABLE IF EXISTS admins CASCADE;

-- ============================================
-- DONNÉES DE TEST / ADMIN PAR DÉFAUT
-- ============================================

-- Insérer un admin par défaut (mot de passe: admin123)
-- Hash bcrypt généré pour 'admin123'
INSERT INTO members (first_name, last_name, email, password_hash, role, join_date, "createdAt", "updatedAt")
VALUES (
    'Admin',
    'Principal',
    'admin@co-garden.fr',
    '$2b$10$oreELu37TG92okoZyT42fOozt7kF5Vs/ZbVED37T3hobBrt/d30qe',
    'admin',
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Insertion de 5 membres supplémentaires (mot de passe: password pour tous)
INSERT INTO members (first_name, last_name, email, password_hash, phone, skills, role, join_date, "createdAt", "updatedAt") 
VALUES
    ('Emma', 'Laurent', 'emma.laurent@co-garden.fr', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0144778899', 'jardinage en pot, plantes d''intérieur', 'membre', NOW(), NOW(), NOW()),
    ('Thomas', 'Simon', 'thomas.simon@co-garden.fr', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0622334455', 'arboriculture, verger', 'membre', NOW(), NOW(), NOW()),
    ('Camille', 'Michel', 'camille.michel@co-garden.fr', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0755667788', 'jardinage pédagogique, animation', 'membre', NOW(), NOW(), NOW()),
    ('Nicolas', 'Lefebvre', 'nicolas.lefebvre@co-garden.fr', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0188996655', 'bricolage, construction de bacs', 'membre', NOW(), NOW(), NOW()),
    ('Sarah', 'Garcia', 'sarah.garcia@co-garden.fr', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0699554433', 'plantes grimpantes, rosiers', 'membre', NOW(), NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- PLANTES D'EXEMPLE (Optionnel)
-- ============================================

INSERT INTO plants (name, scientific_name, type, description, care_instructions, image_url)
VALUES
    ('Tomate Cerise', 'Solanum lycopersicum', 'Légume', 'Petite tomate sucrée parfaite pour les salades et snacks', 'Arroser régulièrement, plein soleil, tuteur recommandé', 'https://images.unsplash.com/photo-1592841200221-a6898f307baa'),
    ('Basilic', 'Ocimum basilicum', 'Herbe aromatique', 'Herbe aromatique essentielle en cuisine méditerranéenne', 'Arrosage modéré, soleil, pincer les fleurs pour favoriser les feuilles', 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733'),
    ('Fraisier', 'Fragaria × ananassa', 'Fruit', 'Plante vivace produisant de délicieux fruits rouges', 'Arrosage régulier, mi-ombre, pailler le sol', 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6'),
    ('Laitue', 'Lactuca sativa', 'Légume', 'Salade verte croquante et rafraîchissante', 'Arrosage fréquent, mi-ombre en été, récolte progressive', 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1'),
    ('Menthe', 'Mentha', 'Herbe aromatique', 'Plante aromatique vivace au parfum rafraîchissant', 'Arrosage abondant, mi-ombre, contenir la croissance', 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1')
ON CONFLICT DO NOTHING;

-- ============================================
-- VUES UTILES (Optionnel)
-- ============================================

-- Vue pour les admins (depuis la table members)
CREATE OR REPLACE VIEW admin_users AS
SELECT id, first_name, last_name, email, join_date
FROM members
WHERE role = 'admin';

-- Vue pour les plantes avec compteur de commentaires
CREATE OR REPLACE VIEW plants_with_comments_count AS
SELECT 
    p.*,
    COUNT(c.id) as comments_count
FROM plants p
LEFT JOIN comments c ON p.id = c.plant_id
GROUP BY p.id;

-- ============================================
-- PERMISSIONS (si nécessaire)
-- ============================================

-- Donner tous les droits à l'utilisateur postgres
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- ============================================
-- RÉSUMÉ
-- ============================================

SELECT 'Base de données co_garden configurée avec succès!' as status;
SELECT 'Tables créées:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

SELECT 'Nombre de membres:' as info, COUNT(*) as count FROM members;
SELECT 'Nombre de plantes:' as info, COUNT(*) as count FROM plants;
SELECT 'Nombre de commentaires:' as info, COUNT(*) as count FROM comments;
