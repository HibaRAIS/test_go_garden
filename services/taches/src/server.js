const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const swaggerSpec = require('./config/swagger');
const migrate = require('./database/migrate');
const tasksRoutes = require('./routes/tasks');
const contextRoutes = require('./routes/context');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Co-Garden - Service Tâches API',
  customCss: '.swagger-ui .topbar { display: none }',
}));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'taches',
    timestamp: new Date().toISOString() 
  });
});

app.use('/api/tasks', contextRoutes); // Routes mesh (/tasks/:id/context)
app.use('/api/tasks', tasksRoutes);   // Routes standards

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
║  🌱 Service TÂCHES - Co-Garden                            ║
║  Port: ${PORT}                                              ║
║  Environment: ${process.env.NODE_ENV}                                 ║
║                                                           ║
║  📚 Documentation Swagger:                                ║
║     http://localhost:${PORT}/api-docs                      ║
║                                                           ║
║  🔥 Endpoint Mesh:                                        ║
║     GET /api/tasks/{id}/context                           ║
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
