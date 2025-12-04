const pool = require('./db');
const bcrypt = require('bcryptjs');

async function seed() {
  const client = await pool.connect();

  // Default users to create
  const defaultUsers = [
    {
      email: 'admin@cogarden.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'CoGarden',
      isAdmin: true
    },
    {
      email: 'membre@cogarden.com',
      password: 'membre123',
      firstName: 'Membre',
      lastName: 'Test',
      isAdmin: false
    }
  ];

  try {
    console.log('🌱 Vérification des utilisateurs par défaut...');

    for (const user of defaultUsers) {
      const existing = await client.query(
        'SELECT id FROM members WHERE email = $1',
        [user.email]
      );

      if (existing.rows.length === 0) {
        const passwordHash = await bcrypt.hash(user.password, 10);

        const result = await client.query(
          'INSERT INTO members (email, password_hash, first_name, last_name, is_admin) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [user.email, passwordHash, user.firstName, user.lastName, user.isAdmin]
        );

        console.log(`✅ Utilisateur créé: ${user.email} (${user.isAdmin ? 'admin' : 'membre'})`);
      } else {
        console.log(`ℹ️  Utilisateur existant: ${user.email}`);
      }
    }

    console.log('✅ Seed terminé avec succès !');
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
