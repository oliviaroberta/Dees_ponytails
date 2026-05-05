import { Admin, Product, Review, SiteContent } from "../models/index.js";
import { sequelize } from "../lib/sequelize.js";
import { env } from "../config/env.js";
import { hashPassword } from "../utils/auth.js";
import { defaultProductReviews, defaultProducts, defaultSiteContent } from "../seed/default-data.js";

const seedAdmin = async () => {
  const existing = await Admin.findOne({ where: { email: env.ADMIN_EMAIL } });

  if (existing) {
    return existing;
  }

  return Admin.create({
    email: env.ADMIN_EMAIL,
    fullName: "Store Admin",
    passwordHash: await hashPassword(env.ADMIN_PASSWORD),
    role: "SUPER_ADMIN",
    isActive: true,
  });
};

const seedSiteContent = async () => {
  const existing = await SiteContent.findOne({ where: { key: "main" } });

  if (existing) {
    await existing.update({ content: defaultSiteContent });
    return existing;
  }

  return SiteContent.create({
    key: "main",
    content: defaultSiteContent,
  });
};

const seedProducts = async () => {
  for (const payload of defaultProducts) {
    const [product] = await Product.findOrCreate({
      where: { slug: payload.slug },
      defaults: payload,
    });

    await product.update(payload);
  }
};

const seedReviews = async () => {
  const products = await Product.findAll();
  const productsBySlug = new Map(products.map((product) => [product.slug, product]));

  for (const review of defaultProductReviews) {
    const product = productsBySlug.get(review.productSlug);
    if (!product) continue;

    await Review.findOrCreate({
      where: {
        productId: product.id,
        customerName: review.customerName,
        text: review.text,
      },
      defaults: {
        productId: product.id,
        customerName: review.customerName,
        rating: review.rating,
        text: review.text,
        status: review.status,
      },
    });
  }
};

const main = async () => {
  await sequelize.authenticate();
  await seedAdmin();
  await seedSiteContent();
  await seedProducts();
  await seedReviews();
  console.log("Seed completed successfully");
  await sequelize.close();
};

void main().catch((error) => {
  console.error("Failed to seed database", error);
  process.exit(1);
});
