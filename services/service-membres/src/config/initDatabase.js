const sequelize = require("./database");
const Member = require("../models/Member");
const bcrypt = require("bcrypt"); // ✅ Ajouter bcrypt

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connexion à la base de données établie");

    await sequelize.sync({ force: true });
    console.log("✅ Base de données synchronisée");

    // Hasher les mots de passe manuellement
    const saltRounds = 10;

    // Créer un admin par défaut
    const adminPasswordHash = await bcrypt.hash("admin123", saltRounds);
    await Member.create({
      first_name: "Admin",
      last_name: "Co-Garden",
      email: "admin@co-garden.fr",
      phone: "0102030405",
      password_hash: adminPasswordHash, // ✅ Utiliser le hash directement
      role: "admin",
      skills: "Administration du jardin",
    });

    // Membres normaux
    const alicePasswordHash = await bcrypt.hash("alice123", saltRounds);
    const bobPasswordHash = await bcrypt.hash("bob123", saltRounds);

    await Member.bulkCreate([
      {
        first_name: "Alice",
        last_name: "Dupont",
        email: "alice@co-garden.fr",
        phone: "0123456789",
        password_hash: alicePasswordHash, // ✅ Utiliser le hash directement
        role: "membre",
        skills: "jardinage bio, compostage",
      },
      {
        first_name: "Bob",
        last_name: "Martin",
        email: "bob@co-garden.fr",
        phone: "0987654321",
        password_hash: bobPasswordHash, // ✅ Utiliser le hash directement
        role: "membre",
        skills: "bricolage, taille des arbres",
      },
    ]);

    console.log("✅ Données de test créées");

    // Vérification
    const members = await Member.findAll({
      attributes: ["id", "first_name", "last_name", "email", "role"],
    });
    console.log("📊 Membres créés:");
    members.forEach((member) => {
      console.log(
        `   - ${member.first_name} ${member.last_name} (${member.email}) - ${member.role}`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur initialisation base de données:", error);
    process.exit(1);
  }
}

initializeDatabase();
