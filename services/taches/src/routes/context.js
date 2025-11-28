const express = require('express');
const axios = require('axios');
const pool = require('../database/db');

const router = express.Router();

/**
 * @swagger
 * /api/tasks/{id}/context:
 *   get:
 *     summary: "🔥 ENDPOINT MESH - Vue Contextuelle de la Tâche"
 *     description: |
 *       **Architecture Mesh**: Cet endpoint agrège des données provenant des 3 autres services:
 *       - Service Membres: Noms des membres assignés
 *       - Service Parcelles: Informations sur la parcelle concernée
 *       - Service Catalogue: Détails de la plante concernée
 *       
 *       Retourne une vue complète de la tâche avec son contexte.
 *     tags: [Tâches - Endpoints Mesh]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Vue contextuelle de la tâche
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *                 assignees:
 *                   type: array
 *                   description: Membres assignés (depuis Service Membres)
 *                 plot:
 *                   type: object
 *                   description: Parcelle concernée (depuis Service Parcelles)
 *                 plant:
 *                   type: object
 *                   description: Plante concernée (depuis Service Catalogue)
 *       404:
 *         description: Tâche non trouvée
 */
router.get('/:id/context', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Récupérer la tâche et ses assignations (local)
    const taskResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    const task = taskResult.rows[0];

    // Récupérer les IDs des membres assignés
    const assignmentsResult = await pool.query(
      'SELECT member_id FROM task_assignments WHERE task_id = $1',
      [id]
    );
    const memberIds = assignmentsResult.rows.map(row => row.member_id);

    // 2. MESH: Appeler les 3 autres services
    const promises = [];

    // Service Membres (pour les assignés)
    if (memberIds.length > 0) {
      promises.push(
        axios.get(`${process.env.SERVICE_MEMBRES_URL}/api/members`, {
          params: { ids: memberIds.join(',') },
          timeout: 5000,
        })
      );
    } else {
      promises.push(Promise.resolve({ data: [] }));
    }

    // Service Parcelles (si une parcelle est associée)
    if (task.plot_id) {
      promises.push(
        axios.get(`${process.env.SERVICE_PARCELLES_URL}/api/plots/${task.plot_id}`, {
          timeout: 5000,
        })
      );
    } else {
      promises.push(Promise.resolve({ data: null }));
    }

    // Service Catalogue (si une plante est associée)
    if (task.plant_id) {
      promises.push(
        axios.get(`${process.env.SERVICE_CATALOGUE_URL}/api/plants/${task.plant_id}`, {
          timeout: 5000,
        })
      );
    } else {
      promises.push(Promise.resolve({ data: null }));
    }

    const [membersResponse, plotResponse, plantResponse] = await Promise.allSettled(promises);

    // 3. Extraire les données
    const assignees = membersResponse.status === 'fulfilled' ? membersResponse.value.data : [];
    const plot = plotResponse.status === 'fulfilled' ? plotResponse.value.data : null;
    const plant = plantResponse.status === 'fulfilled' ? plantResponse.value.data : null;

    // 4. Retourner la vue agrégée
    res.json({
      task,
      assignees,
      plot,
      plant,
      _metadata: {
        assignees_count: assignees.length,
        services_status: {
          membres: membersResponse.status,
          parcelles: plotResponse.status,
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
