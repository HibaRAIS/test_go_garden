const pool = require('./db');

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Début de la migration de la base de données parcelles_db...');

    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS plots (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        location_ref TEXT,
        size_sqm INTEGER,
        current_plant_id UUID,
        member_id UUID NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_plots_member ON plots(member_id);
      CREATE INDEX IF NOT EXISTS idx_plots_plant ON plots(current_plant_id);
    `);

    // Create assignment_requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS assignment_requests (
        id SERIAL PRIMARY KEY,
        plot_id UUID REFERENCES plots(id) ON DELETE CASCADE,
        member_id UUID NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_assignment_requests_status ON assignment_requests(status);
      CREATE INDEX IF NOT EXISTS idx_assignment_requests_plot ON assignment_requests(plot_id);
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
