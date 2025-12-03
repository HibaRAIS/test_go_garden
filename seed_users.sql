-- Utilisateurs de test pour Co-Garden
-- Admin (mot de passe: admin123)
INSERT INTO users (name, email, password_hash, is_admin) 
VALUES ('Admin Test', 'admin@cogarden.com', '$2a$10$zlXi3maVR0Oe06Oaty2WfeI0bSUcXsRk3q898w2MPkvylEAbG5x5a', true);

-- Membre (mot de passe: membre123)
INSERT INTO users (name, email, password_hash, is_admin) 
VALUES ('Jean Dupont', 'membre@cogarden.com', '$2a$10$pitvS4SFtvIj1bwKjF9kE./1oiVZxKrUDb4qeTL63xaF8nb.BRwhO', false);
