const express = require('express');
const pool = require('../database/db');
const axios = require('axios');
const multer = require('multer');

const router = express.Router();
const upload = multer(); // For parsing multipart/form-data

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
    
    // Transformer les données pour correspondre au format frontend
    const plots = result.rows.map(plot => ({
      id: plot.id,
      name: plot.name,
      surface: plot.size_sqm || 0,
      soil_type: plot.location_ref || '',
      status: plot.member_id ? 'occupied' : 'available',
      occupant: plot.member_id || null,
      occupantid: plot.member_id || null,
      current_plant: plot.current_plant_id || null,
      image: null,
      created_at: plot.created_at
    }));
    
    res.json(plots);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', upload.none(), async (req, res) => {
  try {
    // Accept both frontend field names and backend field names
    const name = req.body.name;
    const location_ref = req.body.location_ref || req.body.soil_type || null;
    const size_sqm = req.body.size_sqm || req.body.surface || null;
    
    // Handle empty strings as null for UUID fields
    let current_plant_id = req.body.current_plant_id || req.body.current_plant;
    if (!current_plant_id || current_plant_id === '' || current_plant_id === 'undefined') {
      current_plant_id = null;
    }
    
    let member_id = req.body.member_id || req.body.occupantid;
    if (!member_id || member_id === '' || member_id === 'undefined') {
      member_id = null;
    }

    if (!name) {
      return res.status(400).json({ error: 'Nom requis' });
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

// ===== ROUTES SPÉCIFIQUES (doivent être AVANT /:id) =====

/**
 * @swagger
 * /api/plots/member-view:
 *   get:
 *     summary: Liste des parcelles pour la vue membre (enrichie avec statut de demande)
 *     tags: [Parcelles]
 *     responses:
 *       200:
 *         description: Liste des parcelles enrichie
 */
router.get('/member-view', async (req, res) => {
  try {
    // Extraire l'ID utilisateur du token (header Authorization: Bearer <token>)
    let currentUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        // Décoder le token (simple base64 decode pour JWT payload)
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        currentUserId = payload.id || payload.userId || payload.sub;
      } catch (e) {
        console.log('Token decode error:', e);
      }
    }

    // Récupérer toutes les parcelles
    const plotsResult = await pool.query('SELECT * FROM plots ORDER BY created_at DESC');
    const plots = plotsResult.rows;

    // Récupérer toutes les demandes d'assignation
    const requestsResult = await pool.query('SELECT * FROM assignment_requests');
    const requests = requestsResult.rows;

    // Enrichir chaque parcelle avec les infos pour le frontend
    const enrichedPlots = plots.map(plot => {
      // Trouver la demande pour cette parcelle de l'utilisateur courant
      const userRequest = currentUserId 
        ? requests.find(r => r.plot_id === plot.id && r.member_id === currentUserId)
        : null;
      
      // Trouver toutes les demandes pending pour cette parcelle
      const pendingRequest = requests.find(r => r.plot_id === plot.id && r.status === 'pending');

      return {
        id: plot.id,
        name: plot.name,
        surface: plot.size_sqm || 0,
        soil_type: plot.location_ref || '',
        status: plot.member_id ? 'occupied' : 'available',
        occupant: plot.member_id || null,
        occupantid: plot.member_id || null,
        current_plant: plot.current_plant_id || null,
        image: null,
        // Champs enrichis pour le frontend
        isCurrentUserOccupant: currentUserId ? (plot.member_id === currentUserId) : false,
        isCurrentUserRequesting: userRequest ? true : false,
        requestStatus: userRequest ? userRequest.status : null,
        requestingMemberId: pendingRequest ? pendingRequest.member_id : null,
        created_at: plot.created_at
      };
    });

    res.json(enrichedPlots);
  } catch (error) {
    console.error('Erreur member-view:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/plots/available-members:
 *   get:
 *     summary: Liste des membres disponibles (proxy vers service membres)
 *     tags: [Parcelles]
 */
router.get('/available-members', async (req, res) => {
  try {
    // Proxy vers le service membres
    const response = await axios.get('http://service-membres:8001/api/members');
    res.json(response.data);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des membres' });
  }
});

/**
 * @swagger
 * /api/plots/available-plants:
 *   get:
 *     summary: Liste des plantes disponibles (proxy vers service catalogue)
 *     tags: [Parcelles]
 */
router.get('/available-plants', async (req, res) => {
  try {
    // Proxy vers le service catalogue
    const response = await axios.get('http://service-catalogue:8004/api/plants');
    res.json(response.data);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des plantes' });
  }
});

/**
 * @swagger
 * /api/plots/request-assignment:
 *   post:
 *     summary: Demander l'assignation d'une parcelle
 *     tags: [Parcelles]
 */
router.post('/request-assignment', async (req, res) => {
  try {
    const { plotId } = req.body;
    
    // Extraire l'ID utilisateur du token
    let memberId = req.body.memberId; // fallback si envoyé dans le body
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        memberId = payload.id || payload.userId || payload.sub || memberId;
      } catch (e) {
        console.log('Token decode error:', e);
      }
    }

    if (!memberId) {
      return res.status(400).json({ error: 'Member ID requis' });
    }

    if (!plotId) {
      return res.status(400).json({ error: 'Plot ID requis' });
    }

    // Vérifier si une demande existe déjà
    const existingRequest = await pool.query(
      'SELECT * FROM assignment_requests WHERE plot_id = $1 AND member_id = $2 AND status = $3',
      [plotId, memberId, 'pending']
    );

    if (existingRequest.rows.length > 0) {
      return res.status(400).json({ error: 'Une demande est déjà en cours pour cette parcelle' });
    }

    const result = await pool.query(
      'INSERT INTO assignment_requests (plot_id, member_id) VALUES ($1, $2) RETURNING *',
      [plotId, memberId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur request-assignment:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/plots/assignment-requests/pending:
 *   get:
 *     summary: Liste des demandes d'assignation en attente
 *     tags: [Parcelles]
 */
router.get('/assignment-requests/pending', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ar.*, p.name as plot_name 
       FROM assignment_requests ar 
       LEFT JOIN plots p ON ar.plot_id = p.id 
       WHERE ar.status = 'pending' 
       ORDER BY ar.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/plots/assignment-requests/all:
 *   get:
 *     summary: Liste de toutes les demandes d'assignation
 *     tags: [Parcelles]
 */
router.get('/assignment-requests/all', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ar.*, p.name as plot_name 
       FROM assignment_requests ar 
       LEFT JOIN plots p ON ar.plot_id = p.id 
       ORDER BY ar.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/plots/assignment-requests/{id}/approve:
 *   post:
 *     summary: Approuver une demande d'assignation
 *     tags: [Parcelles]
 */
router.post('/assignment-requests/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer la demande
    const requestResult = await pool.query(
      'SELECT * FROM assignment_requests WHERE id = $1',
      [id]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }

    const request = requestResult.rows[0];

    // Mettre à jour la parcelle (assigner le membre)
    await pool.query(
      `UPDATE plots SET member_id = $1 WHERE id = $2`,
      [request.member_id, request.plot_id]
    );

    // Mettre à jour le statut de la demande
    const result = await pool.query(
      `UPDATE assignment_requests SET status = 'approved', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur approve:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/plots/assignment-requests/{id}/reject:
 *   post:
 *     summary: Rejeter une demande d'assignation
 *     tags: [Parcelles]
 */
router.post('/assignment-requests/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE assignment_requests SET status = 'rejected', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/plots/assignment-requests/{id}:
 *   delete:
 *     summary: Supprimer une demande d'assignation
 *     tags: [Parcelles]
 */
router.delete('/assignment-requests/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM assignment_requests WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }

    res.json({ message: 'Demande supprimée avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== ROUTES AVEC PARAMÈTRES (doivent être APRÈS les routes spécifiques) =====

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

/**
 * @swagger
 * /api/plots/{id}:
 *   put:
 *     summary: Mettre à jour une parcelle
 *     tags: [Parcelles]
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
 *             $ref: '#/components/schemas/PlotInput'
 *     responses:
 *       200:
 *         description: Parcelle mise à jour
 *       404:
 *         description: Parcelle non trouvée
 */
router.put('/:id', upload.none(), async (req, res) => {
  try {
    const { id } = req.params;
    // Accept both frontend and backend field names
    const name = req.body.name;
    const location_ref = req.body.location_ref || req.body.soil_type;
    const size_sqm = req.body.size_sqm || req.body.surface;
    
    // Handle empty strings as null for UUID fields
    let current_plant_id = req.body.current_plant_id || req.body.current_plant;
    if (!current_plant_id || current_plant_id === '' || current_plant_id === 'undefined') {
      current_plant_id = null;
    }
    
    let member_id = req.body.member_id || req.body.occupantid;
    if (!member_id || member_id === '' || member_id === 'undefined') {
      member_id = null;
    }

    const result = await pool.query(
      `UPDATE plots 
       SET name = COALESCE($1, name),
           location_ref = COALESCE($2, location_ref),
           size_sqm = COALESCE($3, size_sqm),
           current_plant_id = $4,
           member_id = $5
       WHERE id = $6
       RETURNING *`,
      [name, location_ref, size_sqm, current_plant_id, member_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parcelle non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/plots/{id}:
 *   delete:
 *     summary: Supprimer une parcelle
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
 *         description: Parcelle supprimée
 *       404:
 *         description: Parcelle non trouvée
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM plots WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parcelle non trouvée' });
    }

    res.json({ message: 'Parcelle supprimée avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /api/plots/{id}/assign:
 *   put:
 *     summary: Assigner un membre à une parcelle
 *     tags: [Parcelles]
 */
router.put('/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { occupantId } = req.body;

    const result = await pool.query(
      `UPDATE plots 
       SET member_id = $1, 
           status = 'occupied',
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [occupantId, id]
    );

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
