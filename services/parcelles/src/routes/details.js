const express = require('express');
const axios = require('axios');
const pool = require('../database/db');

const router = express.Router();

/**
 * @swagger
 * /api/plots/{id}/details:
 *   get:
 *     summary: "🔥 ENDPOINT MESH - Vue Détaillée de la Parcelle"
 *     description: |
 *       **Architecture Mesh**: Cet endpoint agrège des données provenant des 3 autres services:
 *       - Service Membres: Informations du propriétaire
 *       - Service Tâches: Liste des tâches liées à cette parcelle
 *       - Service Catalogue: Détails de la plante cultivée
 *       
 *       Retourne une vue complète de la parcelle avec son contexte.
 *     tags: [Parcelles - Endpoints Mesh]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Vue détaillée de la parcelle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 plot:
 *                   $ref: '#/components/schemas/Plot'
 *                 owner:
 *                   type: object
 *                   description: Propriétaire de la parcelle (depuis Service Membres)
 *                 tasks:
 *                   type: array
 *                   description: Tâches liées à cette parcelle (depuis Service Tâches)
 *                 plant_info:
 *                   type: object
 *                   description: Détails de la plante cultivée (depuis Service Catalogue)
 *       404:
 *         description: Parcelle non trouvée
 */
router.get('/:id/details', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Récupérer la parcelle (local)
    const plotResult = await pool.query('SELECT * FROM plots WHERE id = $1', [id]);

    if (plotResult.rows.length === 0) {
      return res.status(404).json({ error: 'Parcelle non trouvée' });
    }

    const plot = plotResult.rows[0];

    // 2. MESH: Appeler les 3 autres services en parallèle
    const [ownerResponse, tasksResponse, plantResponse] = await Promise.allSettled([
      // Service Membres
      axios.get(`${process.env.SERVICE_MEMBRES_URL}/api/members/${plot.member_id}`, {
        timeout: 5000,
      }),
      // Service Tâches
      axios.get(`${process.env.SERVICE_TACHES_URL}/api/tasks`, {
        params: { plot_id: id },
        timeout: 5000,
      }),
      // Service Catalogue (si une plante est cultivée)
      plot.current_plant_id
        ? axios.get(`${process.env.SERVICE_CATALOGUE_URL}/api/plants/${plot.current_plant_id}`, {
            timeout: 5000,
          })
        : Promise.resolve({ data: null }),
    ]);

    // 3. Extraire les données
    const owner = ownerResponse.status === 'fulfilled' ? ownerResponse.value.data : null;
    const tasks = tasksResponse.status === 'fulfilled' ? tasksResponse.value.data : [];
    const plant_info = plantResponse.status === 'fulfilled' ? plantResponse.value.data : null;

    // 4. Retourner la vue agrégée
    res.json({
      plot,
      owner,
      tasks,
      plant_info,
      _metadata: {
        tasks_count: tasks.length,
        services_status: {
          membres: ownerResponse.status,
          taches: tasksResponse.status,
          catalogue: plantResponse.status,
        },
      },
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
