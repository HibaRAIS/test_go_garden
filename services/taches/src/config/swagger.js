const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Co-Garden - Service Tâches API',
      version: '1.0.0',
      description: `
        Service Contexte Tâche - Gestion des tâches collectives et individuelles.
        
        **Architecture Mesh**: Ce service consomme des données des services Membres, Parcelles et Catalogue 
        pour fournir une vue contextuelle de chaque tâche.
      `,
    },
    servers: [
      {
        url: 'http://localhost:3003',
        description: 'Serveur de développement',
      },
    ],
    components: {
      schemas: {
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            due_date: { type: 'string', format: 'date-time' },
            plot_id: { type: 'string', format: 'uuid' },
            plant_id: { type: 'string', format: 'uuid' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        TaskInput: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', example: 'Arrosage des tomates' },
            description: { type: 'string', example: 'Arroser abondamment le matin' },
            due_date: { type: 'string', format: 'date-time' },
            plot_id: { type: 'string', format: 'uuid' },
            plant_id: { type: 'string', format: 'uuid' },
            assigned_to: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
              description: 'Liste des IDs des membres assignés',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
