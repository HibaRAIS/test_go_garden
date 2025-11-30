const pool = require('./db');

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Début de la migration de la base de données catalogue_db...');

    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS plants (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        scientific_name TEXT,
        description TEXT,
        planting_season TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        text TEXT NOT NULL,
        plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
        author_id UUID NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_comments_plant ON comments(plant_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
    `);

    console.log('✅ Migration terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = migrate;
