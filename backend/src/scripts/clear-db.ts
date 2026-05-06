import {
  Order,
  OrderItem,
  Product,
  RefreshToken,
  Review,
  SaleCampaign,
  SaleItem,
  SiteContent,
} from "../models/index.js";
import { sequelize } from "../lib/sequelize.js";

const main = async () => {
  await sequelize.authenticate();

  await sequelize.transaction(async (transaction) => {
    await RefreshToken.destroy({ where: {}, truncate: true, cascade: true, transaction });
    await Review.destroy({ where: {}, truncate: true, cascade: true, transaction });
    await SaleItem.destroy({ where: {}, truncate: true, cascade: true, transaction });
    await SaleCampaign.destroy({ where: {}, truncate: true, cascade: true, transaction });
    await OrderItem.destroy({ where: {}, truncate: true, cascade: true, transaction });
    await Order.destroy({ where: {}, truncate: true, cascade: true, transaction });
    await Product.destroy({ where: {}, truncate: true, cascade: true, transaction });
    await SiteContent.destroy({ where: {}, truncate: true, cascade: true, transaction });
  });

  console.log("Database content cleared successfully");
  console.log("Admin accounts were preserved");

  await sequelize.close();
};

void main().catch((error) => {
  console.error("Failed to clear database", error);
  process.exit(1);
});
