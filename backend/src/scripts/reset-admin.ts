import { Admin, RefreshToken } from "../models/index.js";
import { sequelize } from "../lib/sequelize.js";
import { env } from "../config/env.js";
import { hashPassword } from "../utils/auth.js";

const main = async () => {
  await sequelize.authenticate();

  const passwordHash = await hashPassword(env.ADMIN_PASSWORD);
  const existingByEmail = await Admin.findOne({ where: { email: env.ADMIN_EMAIL } });

  if (existingByEmail) {
    await existingByEmail.update({
      email: env.ADMIN_EMAIL,
      passwordHash,
      fullName: existingByEmail.fullName || "Store Admin",
      role: existingByEmail.role || "SUPER_ADMIN",
      isActive: true,
    });

    await RefreshToken.destroy({ where: { adminId: existingByEmail.id } });
    console.log(`Admin reset successfully for ${env.ADMIN_EMAIL}`);
    await sequelize.close();
    return;
  }

  const firstAdmin = await Admin.findOne({
    order: [["createdAt", "ASC"]],
  });

  if (firstAdmin) {
    await firstAdmin.update({
      email: env.ADMIN_EMAIL,
      passwordHash,
      fullName: firstAdmin.fullName || "Store Admin",
      role: firstAdmin.role || "SUPER_ADMIN",
      isActive: true,
    });

    await RefreshToken.destroy({ where: { adminId: firstAdmin.id } });
    console.log(`Primary admin reset successfully for ${env.ADMIN_EMAIL}`);
    await sequelize.close();
    return;
  }

  const created = await Admin.create({
    email: env.ADMIN_EMAIL,
    fullName: "Store Admin",
    passwordHash,
    role: "SUPER_ADMIN",
    isActive: true,
  });

  await RefreshToken.destroy({ where: { adminId: created.id } });
  console.log(`Admin created successfully for ${env.ADMIN_EMAIL}`);
  await sequelize.close();
};

void main().catch((error) => {
  console.error("Failed to reset admin", error);
  process.exit(1);
});
