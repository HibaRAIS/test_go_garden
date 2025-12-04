-- Seed initial users for Co-Garden
-- This file is automatically executed when the database container starts

-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create members table if not exists
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  skills TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);

-- Insert admin user (password: admin123)
INSERT INTO members (email, password_hash, first_name, last_name, is_admin)
VALUES (
  'admin@cogarden.com',
  '$2a$10$aLDfsdTMBMY2Kg0OTuijNOYWZTXhkVruN.B/aBEIRY/n515VtLaqq',
  'Admin',
  'CoGarden',
  true
) ON CONFLICT (email) DO NOTHING;

-- Insert membre user (password: membre123)
INSERT INTO members (email, password_hash, first_name, last_name, is_admin)
VALUES (
  'membre@cogarden.com',
  '$2a$10$9zDGkW588jIYiHJJVq022.B2xpGId8nE4yC3j9oFYUIpZO/Vr3j6O',
  'Membre',
  'Test',
  false
) ON CONFLICT (email) DO NOTHING;
