import { sequelize } from "../lib/sequelize.js";
import "../models/index.js";

const ensureProductStatusEnum = async () => {
  await sequelize.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public'
          AND t.typname = 'enum_products_status'
      ) THEN
        ALTER TYPE "public"."enum_products_status" ADD VALUE IF NOT EXISTS 'ARCHIVED';
        ALTER TYPE "public"."enum_products_status" ADD VALUE IF NOT EXISTS 'DRAFT';
      END IF;
    END $$;
  `);
};

const main = async () => {
  await sequelize.authenticate();
  await ensureProductStatusEnum();
  await sequelize.sync({ alter: true });
  console.log("Database synced successfully");
  await sequelize.close();
};

void main().catch((error) => {
  console.error("Failed to sync database", error);
  process.exit(1);
});
