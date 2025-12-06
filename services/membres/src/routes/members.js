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
      `SELECT id, CONCAT(first_name, ' ', last_name) AS name, email, is_admin, phone, skills, created_at
       FROM members WHERE id = $1`,
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
      // Si pas d'IDs, retourner uniquement les membres (pas les admins)
      const result = await pool.query(
        `SELECT id,
                CONCAT(first_name, ' ', last_name) AS name,
                email,
                is_admin,
                phone,
                skills,
                created_at
         FROM members
         WHERE is_admin = false
         ORDER BY created_at DESC`
      );
      return res.json(result.rows);
    }

    // Parser les IDs
    const idArray = ids.split(',').map(id => id.trim());

    const result = await pool.query(
      `SELECT id,
              CONCAT(first_name, ' ', last_name) AS name,
              email,
              is_admin,
              phone,
              skills,
              created_at
       FROM members
       WHERE id = ANY($1)`,
      [idArray]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des membres:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/members/{id}:
 *   put:
 *     summary: Mettre à jour un membre
 *     tags: [Membres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               skills:
 *                 type: string
 *     responses:
 *       200:
 *         description: Membre mis à jour
 *       404:
 *         description: Membre non trouvé
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, skills } = req.body;

    const result = await pool.query(
      `UPDATE members 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           skills = COALESCE($5, skills)
       WHERE id = $6
       RETURNING id, CONCAT(first_name, ' ', last_name) AS name, email, is_admin, phone, skills, created_at`,
      [first_name, last_name, email, phone, skills, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Membre non trouvé' });
    }

    // Formater la réponse
    const user = result.rows[0];
    const nameParts = (user.name || '').split(' ');
    
    res.json({
      id: user.id,
      first_name: nameParts[0] || '',
      last_name: nameParts.slice(1).join(' ') || '',
      email: user.email,
      role: user.is_admin ? 'admin' : 'membre',
      phone: user.phone,
      skills: user.skills,
      join_date: user.created_at
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du membre:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/members/{id}:
 *   delete:
 *     summary: Supprimer un membre
 *     tags: [Membres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Membre supprimé
 *       404:
 *         description: Membre non trouvé
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Membre non trouvé' });
    }

    res.json({ message: 'Membre supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du membre:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
