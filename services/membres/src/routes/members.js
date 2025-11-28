const express = require('express');
const pool = require('../database/db');

const router = express.Router();

/**
 * @swagger
 * /api/members/{id}:
 *   get:
 *     summary: Obtenir les informations d'un membre (consommé par les autres services)
 *     tags: [Membres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Informations du membre
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Membre non trouvé
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Membre non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du membre:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/members:
 *   get:
 *     summary: Obtenir les informations de plusieurs membres (consommé par les autres services)
 *     tags: [Membres]
 *     parameters:
 *       - in: query
 *         name: ids
 *         schema:
 *           type: string
 *         description: Liste d'IDs séparés par des virgules (ex&#58; id1,id2,id3)
 *     responses:
 *       200:
 *         description: Liste des membres
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/', async (req, res) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      // Si pas d'IDs, retourner tous les membres
      const result = await pool.query(
        'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC'
      );
      return res.json(result.rows);
    }

    // Parser les IDs
    const idArray = ids.split(',').map(id => id.trim());

    const result = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ANY($1)',
      [idArray]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des membres:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
