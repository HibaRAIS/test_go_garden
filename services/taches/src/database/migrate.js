const pool = require('./db');

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Début de la migration de la base de données taches_db...');

    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        description TEXT,
        due_date TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending',
        type VARCHAR(20) DEFAULT 'other',
        plot_id UUID,
        plant_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add missing columns if they don't exist
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='status') THEN
          ALTER TABLE tasks ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='type') THEN
          ALTER TABLE tasks ADD COLUMN type VARCHAR(20) DEFAULT 'other';
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS task_assignments (
        id SERIAL PRIMARY KEY,
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        member_id UUID NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(task_id, member_id)
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_plot ON tasks(plot_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_plant ON tasks(plant_id);
      CREATE INDEX IF NOT EXISTS idx_assignments_task ON task_assignments(task_id);
      CREATE INDEX IF NOT EXISTS idx_assignments_member ON task_assignments(member_id);
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
