const express = require('express');
const pool = require('../database/db');

const router = express.Router();

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Liste de toutes les tâches (avec filtres optionnels)
 *     tags: [Tâches]
 *     parameters:
 *       - in: query
 *         name: assigned_to
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par membre assigné (consommé par Service Membres)
 *       - in: query
 *         name: plot_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par parcelle (consommé par Service Parcelles)
 *       - in: query
 *         name: plant_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par plante (consommé par Service Catalogue)
 *     responses:
 *       200:
 *         description: Liste des tâches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *   post:
 *     summary: Créer une nouvelle tâche
 *     tags: [Tâches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       201:
 *         description: Tâche créée
 */
router.get('/', async (req, res) => {
  try {
    const { assigned_to, plot_id, plant_id } = req.query;

    if (assigned_to) {
      // Filtrer par membre assigné
      const result = await pool.query(
        `SELECT t.* FROM tasks t
         INNER JOIN task_assignments ta ON t.id = ta.task_id
         WHERE ta.member_id = $1
         ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC`,
        [assigned_to]
      );
      return res.json(result.rows);
    }

    if (plot_id) {
      // Filtrer par parcelle
      const result = await pool.query(
        'SELECT * FROM tasks WHERE plot_id = $1 ORDER BY due_date ASC NULLS LAST, created_at DESC',
        [plot_id]
      );
      return res.json(result.rows);
    }

    if (plant_id) {
      // Filtrer par plante
      const result = await pool.query(
        'SELECT * FROM tasks WHERE plant_id = $1 ORDER BY due_date ASC NULLS LAST, created_at DESC',
        [plant_id]
      );
      return res.json(result.rows);
    }

    // Toutes les tâches
    const result = await pool.query(
      'SELECT * FROM tasks ORDER BY due_date ASC NULLS LAST, created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { title, description, due_date, plot_id, plant_id, assigned_to } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Titre requis' });
    }

    await client.query('BEGIN');

    // Créer la tâche
    const taskResult = await client.query(
      'INSERT INTO tasks (title, description, due_date, plot_id, plant_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, due_date, plot_id, plant_id]
    );

    const task = taskResult.rows[0];

    // Assigner aux membres si fourni
    if (assigned_to && Array.isArray(assigned_to) && assigned_to.length > 0) {
      for (const member_id of assigned_to) {
        await client.query(
          'INSERT INTO task_assignments (task_id, member_id) VALUES ($1, $2)',
          [task.id, member_id]
        );
      }
    }

    await client.query('COMMIT');

    res.status(201).json(task);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    client.release();
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Obtenir une tâche par ID (simple)
 *     tags: [Tâches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tâche trouvée
 *       404:
 *         description: Tâche non trouvée
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Mettre à jour une tâche
 *     tags: [Tâches]
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
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       200:
 *         description: Tâche mise à jour
 *       404:
 *         description: Tâche non trouvée
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, due_date, status, type, plot_id, plant_id } = req.body;

    const result = await pool.query(
      `UPDATE tasks 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           due_date = COALESCE($3, due_date),
           status = COALESCE($4, status),
           type = COALESCE($5, type),
           plot_id = COALESCE($6, plot_id),
           plant_id = COALESCE($7, plant_id),
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [title, description, due_date, status, type, plot_id, plant_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Supprimer une tâche
 *     tags: [Tâches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tâche supprimée
 *       404:
 *         description: Tâche non trouvée
 */
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    
    await client.query('BEGIN');
    
    // Supprimer d'abord les assignations
    await client.query('DELETE FROM task_assignments WHERE task_id = $1', [id]);
    
    // Supprimer la tâche
    const result = await client.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }
    
    await client.query('COMMIT');
    res.json({ message: 'Tâche supprimée avec succès' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    client.release();
  }
});

module.exports = router;
