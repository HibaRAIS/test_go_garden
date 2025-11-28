const express = require('express');
const pool = require('../database/db');

const router = express.Router();

/**
 * @swagger
 * /api/plants:
 *   get:
 *     summary: Liste de toutes les plantes
 *     tags: [Plantes]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Rechercher par nom
 *     responses:
 *       200:
 *         description: Liste des plantes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Plant'
 *   post:
 *     summary: Créer une nouvelle plante
 *     tags: [Plantes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlantInput'
 *     responses:
 *       201:
 *         description: Plante créée
 */
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM plants';
    let params = [];

    if (search) {
      query += ' WHERE LOWER(name) LIKE LOWER($1) OR LOWER(scientific_name) LIKE LOWER($1)';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY name ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, scientific_name, description, planting_season } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nom requis' });
    }

    const result = await pool.query(
      'INSERT INTO plants (name, scientific_name, description, planting_season) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, scientific_name, description, planting_season]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/plants/{id}:
 *   get:
 *     summary: Obtenir une plante par ID (simple, consommé par les autres services)
 *     tags: [Plantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Plante trouvée
 *       404:
 *         description: Plante non trouvée
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM plants WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plante non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/plants/{id}/comments:
 *   post:
 *     summary: Ajouter un commentaire à une plante
 *     tags: [Plantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentInput'
 *     responses:
 *       201:
 *         description: Commentaire ajouté
 */
router.post('/:id/comments', async (req, res) => {
  try {
    const { id: plant_id } = req.params;
    const { text, author_id } = req.body;

    if (!text || !author_id) {
      return res.status(400).json({ error: 'Texte et auteur requis' });
    }

    // Vérifier que la plante existe
    const plantCheck = await pool.query('SELECT id FROM plants WHERE id = $1', [plant_id]);
    if (plantCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Plante non trouvée' });
    }

    const result = await pool.query(
      'INSERT INTO comments (text, plant_id, author_id) VALUES ($1, $2, $3) RETURNING *',
      [text, plant_id, author_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
