const pool = require('./db');

const samplePlants = [
  {
    name: 'Tomate',
    scientific_name: 'Solanum lycopersicum',
    description: 'Légume-fruit rouge, juteux et polyvalent. Riche en vitamines C et K.',
    planting_season: 'Printemps (après les gelées)',
  },
  {
    name: 'Basilic',
    scientific_name: 'Ocimum basilicum',
    description: 'Herbe aromatique au parfum intense. Excellent compagnon de la tomate.',
    planting_season: 'Printemps-Été',
  },
  {
    name: 'Carotte',
    scientific_name: 'Daucus carota',
    description: 'Légume-racine orange, croquant et sucré. Riche en bêta-carotène.',
    planting_season: 'Printemps-Automne',
  },
  {
    name: 'Laitue',
    scientific_name: 'Lactuca sativa',
    description: 'Salade verte à croissance rapide. Parfaite pour les débutants.',
    planting_season: 'Printemps-Automne',
  },
  {
    name: 'Courgette',
    scientific_name: 'Cucurbita pepo',
    description: 'Cucurbitacée productive et facile à cultiver. Fruits verts allongés.',
    planting_season: 'Printemps (après les gelées)',
  },
];

async function seed() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Début du seeding de la base catalogue_db...');

    // Vérifier si déjà des plantes
    const check = await client.query('SELECT COUNT(*) FROM plants');
    if (parseInt(check.rows[0].count) > 0) {
      console.log('⚠️  Des plantes existent déjà, skip du seeding.');
      return;
    }

    // Insérer les plantes
    for (const plant of samplePlants) {
      await client.query(
        'INSERT INTO plants (name, scientific_name, description, planting_season) VALUES ($1, $2, $3, $4)',
        [plant.name, plant.scientific_name, plant.description, plant.planting_season]
      );
    }

    console.log(`✅ ${samplePlants.length} plantes ajoutées avec succès !`);
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
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
