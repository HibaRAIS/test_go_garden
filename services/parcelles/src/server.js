const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const swaggerSpec = require('./config/swagger');
const migrate = require('./database/migrate');
const plotsRoutes = require('./routes/plots');
const detailsRoutes = require('./routes/details');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Co-Garden - Service Parcelles API',
  customCss: '.swagger-ui .topbar { display: none }',
}));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'parcelles',
    timestamp: new Date().toISOString() 
  });
});

app.use('/api/plots', detailsRoutes); // Routes mesh (/plots/:id/details)
app.use('/api/plots', plotsRoutes);   // Routes standards

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
    
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🌱 Service PARCELLES - Co-Garden                         ║
║  Port: ${PORT}                                              ║
║  Environment: ${process.env.NODE_ENV}                                 ║
║                                                           ║
║  📚 Documentation Swagger:                                ║
║     http://localhost:${PORT}/api-docs                      ║
║                                                           ║
║  🔥 Endpoint Mesh:                                        ║
║     GET /api/plots/{id}/details                           ║
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
