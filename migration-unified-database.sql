-- ==========================================
-- SCRIPT DE CRÉATION DES 4 BASES DE DONNÉES
-- ==========================================

-- 1. Service Membres (Database: membres_db)
CREATE DATABASE membres_db;
\c membres_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_admin BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Service Parcelles (Database: parcelles_db)
CREATE DATABASE parcelles_db;
\c parcelles_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS plots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location_ref TEXT,
    size_sqm INTEGER,
    current_plant_id UUID,
    member_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_plots_member ON plots(member_id);
CREATE INDEX IF NOT EXISTS idx_plots_plant ON plots(current_plant_id);

-- 3. Service Taches (Database: taches_db)
CREATE DATABASE taches_db;
\c taches_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP,
    plot_id UUID,
    plant_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS task_assignments (
    id SERIAL PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    member_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, member_id)
);
CREATE INDEX IF NOT EXISTS idx_tasks_plot ON tasks(plot_id);
CREATE INDEX IF NOT EXISTS idx_tasks_plant ON tasks(plant_id);
CREATE INDEX IF NOT EXISTS idx_assignments_task ON task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_assignments_member ON task_assignments(member_id);

-- 4. Service Catalogue (Database: catalogue_db)
CREATE DATABASE catalogue_db;
\c catalogue_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS plants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    scientific_name TEXT,
    description TEXT,
    planting_season TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    author_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_comments_plant ON comments(plant_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
