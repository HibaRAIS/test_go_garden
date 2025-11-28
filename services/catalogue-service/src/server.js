import app from './app.js';
import prisma from './config/prisma.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 8002;
const HOST = '127.0.0.1';

/**
 * Démarrer le serveur
 */
const startServer = async () => {
  try {
    // Tester la connexion à la base de données
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Démarrer le serveur Express
    app.listen(PORT, HOST, () => {
      console.log('=================================');
      console.log('🚀 Co-Garden Catalogue API Server');
      console.log('=================================');
      console.log(`📍 Server running at: http://${HOST}:${PORT}`);
      console.log(`🏥 Health check: http://${HOST}:${PORT}/health`);
      console.log(`📚 API base: http://${HOST}:${PORT}/api`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Gérer l'arrêt gracieux
 */
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

// Démarrer le serveur
startServer();
