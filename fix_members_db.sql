DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS members CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    skills TEXT,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_members_email ON members(email);

-- Admin de test (mot de passe: admin123)
INSERT INTO members (email, password_hash, first_name, last_name, is_admin) 
VALUES ('admin@cogarden.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQHLVt5I.qYVqV7C9wVxqJVJzq8FKe', 'Admin', 'Test', true);

-- Membre de test (mot de passe: membre123)
INSERT INTO members (email, password_hash, first_name, last_name, is_admin) 
VALUES ('membre@cogarden.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQHLVt5I.qYVqV7C9wVxqJVJzq8FKe', 'Jean', 'Dupont', false);
