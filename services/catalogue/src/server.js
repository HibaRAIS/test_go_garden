const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const swaggerSpec = require('./config/swagger');
const migrate = require('./database/migrate');
const seed = require('./database/seed');
const plantsRoutes = require('./routes/plants');
const commentsRoutes = require('./routes/comments');
const reportRoutes = require('./routes/report');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Co-Garden - Service Catalogue API',
  customCss: '.swagger-ui .topbar { display: none }',
}));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'catalogue',
    timestamp: new Date().toISOString() 
  });
});

app.use('/api/plants', reportRoutes);   // Routes mesh (/plants/:id/report)
app.use('/api/plants', plantsRoutes);   // Routes standards
app.use('/api/comments', commentsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

async function startServer() {
  try {
    await migrate();
    await seed(); // Ajouter des plantes exemple
    
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🌱 Service CATALOGUE - Co-Garden                         ║
║  Port: ${PORT}                                              ║
║  Environment: ${process.env.NODE_ENV}                                 ║
║                                                           ║
║  📚 Documentation Swagger:                                ║
║     http://localhost:${PORT}/api-docs                      ║
║                                                           ║
║  🔥 Endpoint Mesh:                                        ║
║     GET /api/plants/{id}/report                           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage:', error);
    process.exit(1);
  }
}

startServer();
