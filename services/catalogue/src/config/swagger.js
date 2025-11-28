const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Co-Garden - Service Catalogue API',
      version: '1.0.0',
      description: `
        Service Rapport Plante - Base de connaissances (Wiki) sur les plantes.
        
        **Architecture Mesh**: Ce service consomme des données des services Membres, Parcelles et Tâches 
        pour fournir un rapport complet de chaque plante.
      `,
    },
    servers: [
      {
        url: 'http://localhost:3004',
        description: 'Serveur de développement',
      },
    ],
    components: {
      schemas: {
        Plant: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            scientific_name: { type: 'string' },
            description: { type: 'string' },
            planting_season: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        PlantInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Tomate' },
            scientific_name: { type: 'string', example: 'Solanum lycopersicum' },
            description: { type: 'string' },
            planting_season: { type: 'string', example: 'Printemps' },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            text: { type: 'string' },
            plant_id: { type: 'string', format: 'uuid' },
            author_id: { type: 'string', format: 'uuid' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        CommentInput: {
          type: 'object',
          required: ['text', 'author_id'],
          properties: {
            text: { type: 'string', example: 'Super variété productive !' },
            author_id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
