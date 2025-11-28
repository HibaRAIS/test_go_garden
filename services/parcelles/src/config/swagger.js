const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Co-Garden - Service Parcelles API',
      version: '1.0.0',
      description: `
        Service Dashboard Parcelle - Gestion des parcelles de terrain et de leur état.
        
        **Architecture Mesh**: Ce service consomme des données des services Membres, Tâches et Catalogue 
        pour fournir une vue détaillée de chaque parcelle.
      `,
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Serveur de développement',
      },
    ],
    components: {
      schemas: {
        Plot: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            location_ref: { type: 'string' },
            size_sqm: { type: 'integer' },
            current_plant_id: { type: 'string', format: 'uuid' },
            member_id: { type: 'string', format: 'uuid' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        PlotInput: {
          type: 'object',
          required: ['name', 'member_id'],
          properties: {
            name: { type: 'string', example: 'Parcelle Nord' },
            location_ref: { type: 'string', example: 'Zone A, Rangée 3' },
            size_sqm: { type: 'integer', example: 25 },
            current_plant_id: { type: 'string', format: 'uuid' },
            member_id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
