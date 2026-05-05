import { sequelize } from "../lib/sequelize.js";
import "../models/index.js";

const main = async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  console.log("Database synced successfully");
  await sequelize.close();
};

void main().catch((error) => {
  console.error("Failed to sync database", error);
  process.exit(1);
});
