import { Router } from "express";
import { Op } from "sequelize";
import { Product } from "../../models/index.js";
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

    const existing = await Product.findOne({ where: { slug: payload.slug } });

    if (existing) {
      throw new AppError("A product with this slug already exists", 409);
    }

    const product = await Product.create(payload);

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

    await product.update(payload);

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

    await product.destroy();

    res.status(204).send();
  }),
);

export { productsRouter };
