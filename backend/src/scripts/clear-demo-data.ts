import {
  GalleryItem,
  Order,
  OrderItem,
  Product,
  Review,
  SaleCampaign,
  SaleItem,
} from "../models/index.js";
import { sequelize } from "../lib/sequelize.js";

const main = async () => {
  await sequelize.authenticate();

  const counts = {
    reviews: await Review.count(),
    saleItems: await SaleItem.count(),
    saleCampaigns: await SaleCampaign.count(),
    orderItems: await OrderItem.count(),
    orders: await Order.count(),
    products: await Product.count(),
    galleryItems: await GalleryItem.count(),
  };

  await sequelize.transaction(async (transaction) => {
    await Review.destroy({ where: {}, truncate: true, cascade: true, transaction });
    await SaleItem.destroy({ where: {}, truncate: true, cascade: true, transaction });
    await SaleCampaign.destroy({ where: {}, truncate: true, cascade: true, transaction });
    await OrderItem.destroy({ where: {}, truncate: true, cascade: true, transaction });
    await Order.destroy({ where: {}, truncate: true, cascade: true, transaction });
    await Product.destroy({ where: {}, truncate: true, cascade: true, transaction });
    await GalleryItem.destroy({ where: {}, truncate: true, cascade: true, transaction });
  });

  console.log("Demo/store data cleared successfully");
  console.log(`- reviews: ${counts.reviews}`);
  console.log(`- sale_items: ${counts.saleItems}`);
  console.log(`- sale_campaigns: ${counts.saleCampaigns}`);
  console.log(`- order_items: ${counts.orderItems}`);
  console.log(`- orders: ${counts.orders}`);
  console.log(`- products: ${counts.products}`);
  console.log(`- gallery_items: ${counts.galleryItems}`);
  console.log("Preserved data:");
  console.log("- admins");
  console.log("- refresh_tokens");
  console.log("- site_content");

  await sequelize.close();
};

void main().catch((error) => {
  console.error("Failed to clear demo/store data", error);
  process.exit(1);
});
