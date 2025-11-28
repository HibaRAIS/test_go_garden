const express = require('express');
const pool = require('../database/db');

const router = express.Router();

/**
 * @swagger
 * /api/plots:
 *   get:
 *     summary: Liste de toutes les parcelles (avec filtres optionnels)
 *     tags: [Parcelles]
 *     parameters:
 *       - in: query
 *         name: member_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par propriétaire (consommé par Service Membres)
 *       - in: query
 *         name: plant_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par plante cultivée (consommé par Service Catalogue)
 *     responses:
 *       200:
 *         description: Liste des parcelles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Plot'
 *   post:
 *     summary: Créer une nouvelle parcelle
 *     tags: [Parcelles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlotInput'
 *     responses:
 *       201:
 *         description: Parcelle créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Plot'
 */
router.get('/', async (req, res) => {
  try {
    const { member_id, plant_id } = req.query;
    let query = 'SELECT * FROM plots';
    let params = [];

    if (member_id) {
      query += ' WHERE member_id = $1';
      params.push(member_id);
    } else if (plant_id) {
      query += ' WHERE current_plant_id = $1';
      params.push(plant_id);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, location_ref, size_sqm, current_plant_id, member_id } = req.body;

    if (!name || !member_id) {
      return res.status(400).json({ error: 'Nom et propriétaire requis' });
    }

    const result = await pool.query(
      'INSERT INTO plots (name, location_ref, size_sqm, current_plant_id, member_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, location_ref, size_sqm, current_plant_id, member_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/plots/{id}:
 *   get:
 *     summary: Obtenir une parcelle par ID (simple)
 *     tags: [Parcelles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Parcelle trouvée
 *       404:
 *         description: Parcelle non trouvée
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM plots WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parcelle non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
