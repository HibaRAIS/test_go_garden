const express = require('express');
const axios = require('axios');
const pool = require('../database/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/profile/dashboard/{member_id}:
 *   get:
 *     summary: "🔥 ENDPOINT MESH - Mon Tableau de Bord 360°"
 *     description: |
 *       **Architecture Mesh**: Cet endpoint agrège des données provenant des 3 autres services:
 *       - Service Parcelles: Liste des parcelles du membre
 *       - Service Tâches: Liste des tâches assignées au membre
 *       - Service Catalogue: Liste des commentaires du membre
 *       
 *       Retourne une vue complète de l'activité du membre.
 *     tags: [Profile - Endpoints Mesh]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: member_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tableau de bord complet du membre
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 plots:
 *                   type: array
 *                   description: Parcelles du membre (depuis Service Parcelles)
 *                 tasks:
 *                   type: array
 *                   description: Tâches assignées (depuis Service Tâches)
 *                 comments:
 *                   type: array
 *                   description: Commentaires du membre (depuis Service Catalogue)
 *       404:
 *         description: Membre non trouvé
 */
router.get('/dashboard/:member_id', authMiddleware, async (req, res) => {
  try {
    const { member_id } = req.params;

    // 1. Récupérer les infos de base du membre (local)
    const userResult = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [member_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Membre non trouvé' });
    }

    const user = userResult.rows[0];

    // 2. MESH: Appeler les 3 autres services en parallèle
    const [plotsResponse, tasksResponse, commentsResponse] = await Promise.allSettled([
      // Service Parcelles
      axios.get(`${process.env.SERVICE_PARCELLES_URL}/api/plots`, {
        params: { member_id },
        timeout: 5000,
      }),
      // Service Tâches
      axios.get(`${process.env.SERVICE_TACHES_URL}/api/tasks`, {
        params: { assigned_to: member_id },
        timeout: 5000,
      }),
      // Service Catalogue
      axios.get(`${process.env.SERVICE_CATALOGUE_URL}/api/comments`, {
        params: { author_id: member_id },
        timeout: 5000,
      }),
    ]);

    // 3. Extraire les données (avec gestion d'erreurs gracieuse)
    const plots = plotsResponse.status === 'fulfilled' ? plotsResponse.value.data : [];
    const tasks = tasksResponse.status === 'fulfilled' ? tasksResponse.value.data : [];
    const comments = commentsResponse.status === 'fulfilled' ? commentsResponse.value.data : [];

    // 4. Retourner la vue agrégée
    res.json({
      user,
      plots,
      tasks,
      comments,
      _metadata: {
        plots_count: plots.length,
        tasks_count: tasks.length,
        comments_count: comments.length,
        services_status: {
          parcelles: plotsResponse.status,
          taches: tasksResponse.status,
          catalogue: commentsResponse.status,
        },
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du dashboard:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
