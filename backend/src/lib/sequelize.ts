import { Sequelize } from "sequelize";
import { env } from "../config/env.js";

export const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: "postgres",
  logging: env.NODE_ENV === "development" ? console.log : false,
  dialectOptions:
    env.NODE_ENV === "production" || env.PGSSL
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : undefined,
  define: {
    underscored: true,
    freezeTableName: true,
  },
});
