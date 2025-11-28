const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const swaggerSpec = require('./config/swagger');
const migrate = require('./database/migrate');
const seed = require('./database/seed');

// Routes
const authRoutes = require('./routes/auth');
const membersRoutes = require('./routes/members');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Co-Garden - Service Membres API',
  customCss: '.swagger-ui .topbar { display: none }',
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'membres',
    timestamp: new Date().toISOString() 
  });
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/profile', profileRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

// Démarrage du serveur
async function startServer() {
  try {
    // Exécuter les migrations
    await migrate();
  await seed();
    
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🌱 Service MEMBRES - Co-Garden                           ║
║  Port: ${PORT}                                              ║
║  Environment: ${process.env.NODE_ENV}                                 ║
║                                                           ║
║  📚 Documentation Swagger:                                ║
║     http://localhost:${PORT}/api-docs                      ║
║                                                           ║
║  🔥 Endpoint Mesh:                                        ║
║     GET /api/profile/dashboard/{member_id}                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage du serveur:', error);
    process.exit(1);
  }
}

startServer();
