const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Co-Garden - Service Membres API',
      version: '1.0.0',
      description: `
        Service Profil Membre 360 - Gestion de l'authentification et agrégation de l'activité utilisateur.
        
        **Architecture Mesh**: Ce service consomme des données des services Parcelles, Tâches et Catalogue 
        pour fournir une vue 360° de l'activité du membre.
      `,
      contact: {
        name: 'Co-Garden Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Serveur de développement',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        RegisterInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Jean Dupont' },
            email: { type: 'string', format: 'email', example: 'jean.dupont@example.com' },
            password: { type: 'string', format: 'password', minLength: 6, example: 'motdepasse123' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'jean.dupont@example.com' },
            password: { type: 'string', format: 'password', example: 'motdepasse123' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
