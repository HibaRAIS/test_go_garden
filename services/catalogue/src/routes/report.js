const express = require('express');
const axios = require('axios');
const pool = require('../database/db');

const router = express.Router();

/**
 * @swagger
 * /api/plants/{id}/report:
 *   get:
 *     summary: "🔥 ENDPOINT MESH - Rapport Complet de la Plante"
 *     description: |
 *       **Architecture Mesh**: Cet endpoint agrège des données provenant des 3 autres services:
 *       - Service Membres: Noms des auteurs des commentaires
 *       - Service Parcelles: Liste des parcelles où cette plante est cultivée
 *       - Service Tâches: Liste des tâches liées à cette plante
 *       
 *       Retourne un rapport complet de la plante avec tout son contexte.
 *     tags: [Plantes - Endpoints Mesh]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Rapport complet de la plante
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 plant:
 *                   $ref: '#/components/schemas/Plant'
 *                 comments:
 *                   type: array
 *                   description: Commentaires avec noms des auteurs (depuis Service Membres)
 *                 plots_cultivating:
 *                   type: array
 *                   description: Parcelles cultivant cette plante (depuis Service Parcelles)
 *                 related_tasks:
 *                   type: array
 *                   description: Tâches liées à cette plante (depuis Service Tâches)
 *       404:
 *         description: Plante non trouvée
 */
router.get('/:id/report', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Récupérer la plante (local)
    const plantResult = await pool.query('SELECT * FROM plants WHERE id = $1', [id]);

    if (plantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Plante non trouvée' });
    }

    const plant = plantResult.rows[0];

    // Récupérer les commentaires (local)
    const commentsResult = await pool.query(
      'SELECT * FROM comments WHERE plant_id = $1 ORDER BY created_at DESC',
      [id]
    );
    const comments = commentsResult.rows;

    // Extraire les IDs des auteurs
    const authorIds = [...new Set(comments.map(c => c.author_id))];

    // 2. MESH: Appeler les 3 autres services en parallèle
    const promises = [];

    // Service Membres (pour les auteurs des commentaires)
    if (authorIds.length > 0) {
      promises.push(
        axios.get(`${process.env.SERVICE_MEMBRES_URL}/api/members`, {
          params: { ids: authorIds.join(',') },
          timeout: 5000,
        })
      );
    } else {
      promises.push(Promise.resolve({ data: [] }));
    }

    // Service Parcelles (parcelles cultivant cette plante)
    promises.push(
      axios.get(`${process.env.SERVICE_PARCELLES_URL}/api/plots`, {
        params: { plant_id: id },
        timeout: 5000,
      })
    );

    // Service Tâches (tâches liées à cette plante)
    promises.push(
      axios.get(`${process.env.SERVICE_TACHES_URL}/api/tasks`, {
        params: { plant_id: id },
        timeout: 5000,
      })
    );

    const [membersResponse, plotsResponse, tasksResponse] = await Promise.allSettled(promises);

    // 3. Extraire les données
    const members = membersResponse.status === 'fulfilled' ? membersResponse.value.data : [];
    const plots_cultivating = plotsResponse.status === 'fulfilled' ? plotsResponse.value.data : [];
    const related_tasks = tasksResponse.status === 'fulfilled' ? tasksResponse.value.data : [];

    // 4. Enrichir les commentaires avec les noms des auteurs
    const membersMap = new Map(members.map(m => [m.id, m]));
    const enrichedComments = comments.map(comment => ({
      ...comment,
      author_name: membersMap.get(comment.author_id)?.name || 'Inconnu',
    }));

    // 5. Retourner le rapport agrégé
    res.json({
      plant,
      comments: enrichedComments,
      plots_cultivating,
      related_tasks,
      _metadata: {
        comments_count: comments.length,
        plots_count: plots_cultivating.length,
        tasks_count: related_tasks.length,
        services_status: {
          membres: membersResponse.status,
          parcelles: plotsResponse.status,
          taches: tasksResponse.status,
        },
      },
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
