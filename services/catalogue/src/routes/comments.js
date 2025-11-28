const express = require('express');
const pool = require('../database/db');

const router = express.Router();

/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: Liste des commentaires (avec filtres optionnels)
 *     tags: [Commentaires]
 *     parameters:
 *       - in: query
 *         name: author_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par auteur (consommé par Service Membres)
 *       - in: query
 *         name: plant_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par plante
 *     responses:
 *       200:
 *         description: Liste des commentaires
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 */
router.get('/', async (req, res) => {
  try {
    const { author_id, plant_id } = req.query;
    let query = 'SELECT * FROM comments';
    let params = [];

    if (author_id) {
      query += ' WHERE author_id = $1';
      params.push(author_id);
    } else if (plant_id) {
      query += ' WHERE plant_id = $1';
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

module.exports = router;
