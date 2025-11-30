const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../database/db');

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Créer un nouveau compte utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Email déjà utilisé ou données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone, skills, role } = req.body;

    // Validation
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: 'Tous les champs obligatoires sont requis' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const password_hash = await bcrypt.hash(password, 10);

    const name = `${first_name} ${last_name}`.trim();
    const is_admin = role === 'admin';

    // Créer l'utilisateur
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, is_admin, phone, skills) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, is_admin, phone, skills, created_at',
      [name, email, password_hash, is_admin, phone, skills]
    );

    const user = result.rows[0];

    // Générer le token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: is_admin ? 'admin' : 'membre' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Formater la réponse pour le frontend
    const member = {
      id: user.id,
      first_name: first_name,
      last_name: last_name,
      email: user.email,
      role: user.is_admin ? 'admin' : 'membre',
      phone: user.phone,
      skills: user.skills,
      join_date: user.created_at
    };

    res.status(201).json({ token, member });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Se connecter à un compte existant
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Identifiants invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Trouver l'utilisateur
    const result = await pool.query(
      'SELECT id, name, email, password_hash, is_admin, phone, skills, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = result.rows[0];

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.is_admin ? 'admin' : 'membre' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Formater la réponse pour le frontend
    const nameParts = user.name.split(' ');
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    const member = {
      id: user.id,
      first_name: first_name,
      last_name: last_name,
      email: user.email,
      role: user.is_admin ? 'admin' : 'membre',
      phone: user.phone,
      skills: user.skills,
      join_date: user.created_at
    };

    res.json({ token, member });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
