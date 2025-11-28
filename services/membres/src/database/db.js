const { Pool } = require('pg');
require('dotenv').config();

// Debug: afficher les credentials
console.log('🔍 Configuration DB:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? '***' : 'UNDEFINED'
});

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test de connexion
pool.on('connect', () => {
  console.log('✅ Connecté à la base de données membres_db');
});

pool.on('error', (err) => {
  console.error('❌ Erreur de connexion PostgreSQL:', err);
  process.exit(-1);
});

module.exports = pool;
