const express = require("express");
const cors = require("cors");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const memberRoutes = require("./routes/memberRoutes");
const authRoutes = require("./routes/authRoutes");
const sequelize = require("./config/database");

const app = express();
const PORT = process.env.PORT || 8001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

// Configuration Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Service Membres - Co-Garden",
      version: "1.0.0",
      description:
        "API complète pour la gestion des membres avec authentification JWT",
      contact: {
        name: "Support Co-Garden",
        email: "support@co-garden.fr",
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Serveur de développement",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Entrez le token JWT avec le préfixe 'Bearer '",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              example: "ERROR_CODE",
            },
            message: {
              type: "string",
              example: "Message d'erreur descriptif",
            },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: "Token manquant ou invalide",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                error: "TOKEN_MANQUANT",
                message: "Token d'authentification requis",
              },
            },
          },
        },
        Forbidden: {
          description: "Accès refusé",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                error: "ACCES_REFUSE",
                message: "Accès réservé aux administrateurs",
              },
            },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Co-Garden - Documentation API",
  })
);

// Routes
app.use("/api/members", memberRoutes);

// ✅ ROUTE RACINE - IMPORTANT !
app.get("/", (req, res) => {
  res.json({
    message: "🌱 Bienvenue sur le Service Membres - Co-Garden",
    service: "Gestion des membres du jardin communautaire",
    version: "1.0.0",
    timestamp: new Date(),
    endpoints: {
      documentation: "/api-docs",
      health: "/health",
      members: "/api/members",
      members_by_id: "/api/members/{id}",
    },
  });
});

// Route de santé
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "members-service",
    timestamp: new Date(),
  });
});

// Fonction de connexion avec retry
async function connectToDatabase(retries = 5, delay = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(
        `🔄 Tentative de connexion à la base de données (${attempt}/${retries})...`
      );
      await sequelize.authenticate();
      console.log("✅ Connexion à la base de données établie");
      return true;
    } catch (error) {
      console.log(
        `❌ Échec de connexion (tentative ${attempt}/${retries}): ${error.message}`
      );

      if (attempt < retries) {
        console.log(`⏳ Attente de ${delay}ms avant nouvelle tentative...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.log("💥 Échec de toutes les tentatives de connexion");
        return false;
      }
    }
  }
}

// Démarrage du serveur
async function startServer() {
  try {
    // Attendre que la base de données soit disponible
    const dbConnected = await connectToDatabase();

    if (!dbConnected) {
      console.log("🚨 Serveur démarré SANS base de données - Mode dégradé");
    }

    app.listen(PORT, () => {
      console.log(`🚀 Service Membres démarré sur le port ${PORT}`);
      console.log(`📍 Page d'accueil: http://localhost:${PORT}/`);
      console.log(`📚 Documentation API: http://localhost:${PORT}/api-docs`);
      console.log(`❤️  Health check: http://localhost:${PORT}/health`);
      console.log(
        dbConnected
          ? "✅ Base de données connectée"
          : "⚠️ Mode sans base de données"
      );
    });
  } catch (error) {
    console.error("❌ Erreur démarrage serveur:", error);
    process.exit(1);
  }
}

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
  ], // URLs de votre frontend
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

startServer();
