const pool = require('./db');
const bcrypt = require('bcryptjs');

async function seed() {
  const client = await pool.connect();

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@cogarden.local';
  const adminName = process.env.ADMIN_NAME || 'Administrateur Co-Garden';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

  try {
    console.log('🌱 Vérification des données initiales membres...');

    const existingAdmin = await client.query(
      'SELECT id, is_admin FROM users WHERE email = $1',
      [adminEmail]
    );

    if (existingAdmin.rows.length === 0) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);

      const result = await client.query(
        'INSERT INTO users (name, email, password_hash, is_admin) VALUES ($1, $2, $3, true) RETURNING id',
        [adminName, adminEmail, passwordHash]
      );

      console.log(`⭐ Utilisateur administrateur créé (id: ${result.rows[0].id})`);
      console.log(`   Email : ${adminEmail}`);
      console.log('   Mot de passe : (défini dans ADMIN_PASSWORD, pensez à le modifier en production)');
    } else if (!existingAdmin.rows[0].is_admin) {
      await client.query(
        'UPDATE users SET is_admin = true WHERE id = $1',
        [existingAdmin.rows[0].id]
      );
      console.log('✅ Utilisateur administrateur existant mis à jour avec le rôle admin.');
    } else {
      console.log('✅ Un utilisateur administrateur existe déjà, aucune action nécessaire.');
    }
  } catch (error) {
    console.error('❌ Erreur lors du seeding de la base membres:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seed;
