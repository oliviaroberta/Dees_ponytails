import { Router } from "express";
import { Op } from "sequelize";
import { OrderItem, Product, Review, SaleItem } from "../../models/index.js";
import { requireAdmin } from "../../middleware/require-admin.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { AppError } from "../../utils/app-error.js";
import { serializeProduct } from "../../utils/serializers.js";
import {
  productBodySchema,
  productListQuerySchema,
  productUpdateSchema,
} from "./products.schemas.js";

const productsRouter = Router();

const getRouteParam = (value: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const findProductByIdOrSlug = async (value: string) => {
  const byId = await Product.findByPk(value);

  if (byId) {
    return byId;
  }

  return Product.findOne({ where: { slug: value } });
};

const inferCategoryFromName = async (name: string, excludeId?: string) => {
  const normalizedName = name.trim().toLowerCase();

  if (!normalizedName) {
    return null;
  }

  const categories = await Product.findAll({
    attributes: ["category"],
    where: {
      ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
    },
  });

  const uniqueCategories = Array.from(
    new Set(
      categories
        .map((product) => product.category.trim())
        .filter(Boolean),
    ),
  ).sort((left, right) => right.length - left.length);

  return (
    uniqueCategories.find((category) => normalizedName.includes(category.toLowerCase())) ?? null
  );
};

const resolveCategory = async ({
  category,
  name,
  excludeId,
}: {
  category?: string;
  name: string;
  excludeId?: string;
}) => {
  const explicitCategory = category?.trim();

  if (explicitCategory) {
    return explicitCategory;
  }

  const inferredCategory = await inferCategoryFromName(name, excludeId);
  return inferredCategory ?? "Ponytails";
};

const countOtherFeaturedProducts = async (excludeId?: string) =>
  Product.count({
    where: {
      featured: true,
      ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
    },
  });

productsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = productListQuerySchema.parse(req.query);
    const where: Record<string | symbol, unknown> = {};

    if (query.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${query.search}%` } },
        { category: { [Op.iLike]: `%${query.search}%` } },
        { textureStyle: { [Op.iLike]: `%${query.search}%` } },
        { color: { [Op.iLike]: `%${query.search}%` } },
        { slug: { [Op.iLike]: `%${query.search}%` } },
      ];
    }

    if (query.category) {
      where.category = { [Op.iLike]: `%${query.category}%` };
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.featured !== undefined) {
      where.featured = query.featured;
    }

    const products = await Product.findAll({
      where,
      limit: query.limit,
      order: [
        ["featured", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    res.json({
      items: products.map(serializeProduct),
      count: products.length,
    });
  }),
);

productsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await findProductByIdOrSlug(getRouteParam(req.params.id));

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    res.json({
      item: serializeProduct(product),
    });
  }),
);

productsRouter.post(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = productBodySchema.parse(req.body);
    const category = await resolveCategory({ category: payload.category, name: payload.name });

    const existing = await Product.findOne({ where: { slug: payload.slug } });

    if (existing) {
      throw new AppError("A product with this slug already exists", 409);
    }

    if (payload.featured) {
      const featuredCount = await countOtherFeaturedProducts();

      if (featuredCount >= 3) {
        throw new AppError("Only 3 products can be featured on the homepage at a time", 400);
      }
    }

    const product = await Product.create({
      ...payload,
      category,
    });

    res.status(201).json({
      message: "Product created successfully",
      item: serializeProduct(product),
    });
  }),
);

productsRouter.patch(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = productUpdateSchema.parse(req.body);
    const product = await findProductByIdOrSlug(getRouteParam(req.params.id));

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (payload.slug && payload.slug !== product.slug) {
      const existing = await Product.findOne({ where: { slug: payload.slug } });

      if (existing) {
        throw new AppError("A product with this slug already exists", 409);
      }
    }

    if (payload.featured === true && !product.featured) {
      const featuredCount = await countOtherFeaturedProducts(product.id);

      if (featuredCount >= 3) {
        throw new AppError("Only 3 products can be featured on the homepage at a time", 400);
      }
    }

    const category =
      payload.name !== undefined || payload.category !== undefined
        ? await resolveCategory({
            category: payload.category,
            name: payload.name ?? product.name,
            excludeId: product.id,
          })
        : undefined;

    await product.update({
      ...payload,
      ...(category ? { category } : {}),
    });

    res.json({
      message: "Product updated successfully",
      item: serializeProduct(product),
    });
  }),
);

productsRouter.delete(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const product = await findProductByIdOrSlug(getRouteParam(req.params.id));

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const relatedOrderCount = await OrderItem.count({
      where: { productId: product.id },
    });

    if (relatedOrderCount > 0) {
      throw new AppError(
        "This product cannot be deleted because it is already part of customer orders. Mark it out of stock instead.",
        400,
      );
    }

    await SaleItem.destroy({
      where: { productId: product.id },
    });

    await Review.destroy({
      where: { productId: product.id },
    });

    await product.destroy();

    res.status(204).send();
  }),
);

export { productsRouter };
