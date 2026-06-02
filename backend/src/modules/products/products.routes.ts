import { Router } from "express";
import { DatabaseError, Op, QueryTypes } from "sequelize";
import { Admin, OrderItem, Product, Review, SaleItem } from "../../models/index.js";
import { requireAdmin } from "../../middleware/require-admin.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { AppError } from "../../utils/app-error.js";
import { serializeProduct } from "../../utils/serializers.js";
import { verifyAccessToken } from "../../utils/auth.js";
import { sequelize } from "../../lib/sequelize.js";
import {
  productBodySchema,
  productListQuerySchema,
  productUpdateSchema,
} from "./products.schemas.js";

const productsRouter = Router();
const PUBLIC_PRODUCT_STATUSES = ["IN_STOCK", "OUT_OF_STOCK"] as const;
const isPublicProductStatus = (status: Product["status"]) =>
  status === "IN_STOCK" || status === "OUT_OF_STOCK";

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

const normalizeOptionalVideo = (video?: string | null) => {
  const trimmed = video?.trim();
  return trimmed ? trimmed : null;
};

const countOtherFeaturedProducts = async (excludeId?: string) =>
  Product.count({
    where: {
      featured: true,
      ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
    },
  });

const resolveFeaturedState = ({
  featured,
  status,
  currentFeatured,
}: {
  featured?: boolean;
  status: Product["status"];
  currentFeatured?: boolean;
}) => {
  if (!isPublicProductStatus(status)) {
    return false;
  }

  return featured ?? currentFeatured ?? false;
};

let productStatusEnumCache: Set<string> | null = null;

const getProductStatusEnumValues = async () => {
  if (productStatusEnumCache) {
    return productStatusEnumCache;
  }

  const rows = await sequelize.query<{ enum_value: string }>(
    `
      SELECT e.enumlabel AS enum_value
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
        AND t.typname = 'enum_products_status'
    `,
    { type: QueryTypes.SELECT },
  );

  productStatusEnumCache = new Set(rows.map((row) => row.enum_value));
  return productStatusEnumCache;
};

const ensureProductStatusSupported = async (status?: Product["status"]) => {
  if (!status) {
    return;
  }

  const enumValues = await getProductStatusEnumValues();
  if (enumValues.has(status)) {
    return;
  }

  throw new AppError(
    "The database product status values are out of date. Run the database sync to enable Archive and Draft statuses.",
    500,
  );
};

const mapProductMutationError = (error: unknown) => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof DatabaseError) {
    const message = error.message || "";

    if (message.includes("enum_products_status")) {
      return new AppError(
        "The database product status values are out of date. Run the database sync to enable Archive and Draft statuses.",
        500,
      );
    }

    if (
      message.includes("violates foreign key constraint") &&
      message.includes("order_items")
    ) {
      return new AppError(
        "This product is linked to existing customer orders, so it cannot be permanently deleted. Mark it as Out of Stock or Archive it instead.",
        400,
      );
    }
  }

  return error;
};

const getOptionalAdmin = async (authorizationHeader?: string) => {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = authorizationHeader.slice("Bearer ".length).trim();
    const payload = verifyAccessToken(token);
    const admin = await Admin.findByPk(payload.adminId);
    return admin && admin.isActive ? admin : null;
  } catch {
    return null;
  }
};

productsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    try {
      const query = productListQuerySchema.parse(req.query);
      const where: Record<string | symbol, unknown> = {};
      const admin = await getOptionalAdmin(req.headers.authorization);
      const canViewAll = query.visibility === "all" && !!admin;

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
      } else if (!canViewAll) {
        where.status = { [Op.in]: PUBLIC_PRODUCT_STATUSES };
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
    } catch (error) {
      console.error("[products][list] request failed", {
        method: req.method,
        url: req.originalUrl,
        query: req.query,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }),
);

productsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await findProductByIdOrSlug(getRouteParam(req.params.id));
    const admin = await getOptionalAdmin(req.headers.authorization);

    if (!product || (!admin && !isPublicProductStatus(product.status))) {
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
    await ensureProductStatusSupported(payload.status);
    const category = await resolveCategory({ category: payload.category, name: payload.name });
    const nextFeatured = resolveFeaturedState({
      featured: payload.featured,
      status: payload.status,
    });

    const existing = await Product.findOne({ where: { slug: payload.slug } });

    if (existing) {
      throw new AppError("A product with this slug already exists", 409);
    }

    if (nextFeatured) {
      const featuredCount = await countOtherFeaturedProducts();

      if (featuredCount >= 3) {
        throw new AppError("Only 3 products can be featured on the homepage at a time", 400);
      }
    }

    const product = await Product.create({
      ...payload,
      featured: nextFeatured,
      video: normalizeOptionalVideo(payload.video),
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
    try {
      const payload = productUpdateSchema.parse(req.body);
      await ensureProductStatusSupported(payload.status);
      const product = await findProductByIdOrSlug(getRouteParam(req.params.id));

      if (!product) {
        throw new AppError("Product not found", 404);
      }

      const nextStatus = payload.status ?? product.status;
      const nextFeatured = resolveFeaturedState({
        featured: payload.featured,
        status: nextStatus,
        currentFeatured: product.featured,
      });

      if (payload.slug && payload.slug !== product.slug) {
        const existing = await Product.findOne({ where: { slug: payload.slug } });

        if (existing) {
          throw new AppError("A product with this slug already exists", 409);
        }
      }

      if (nextFeatured && !product.featured) {
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
        featured: nextFeatured,
        ...(payload.video !== undefined ? { video: normalizeOptionalVideo(payload.video) } : {}),
        ...(category ? { category } : {}),
      });

      res.json({
        message: "Product updated successfully",
        item: serializeProduct(product),
      });
    } catch (error) {
      throw mapProductMutationError(error);
    }
  }),
);

productsRouter.delete(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    try {
      const product = await findProductByIdOrSlug(getRouteParam(req.params.id));

      if (!product) {
        throw new AppError("Product not found", 404);
      }

      const relatedOrderCount = await OrderItem.count({
        where: { productId: product.id },
      });

      if (relatedOrderCount > 0) {
        throw new AppError(
          "This product is linked to existing customer orders, so it cannot be permanently deleted. Mark it as Out of Stock or Archive it instead.",
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
    } catch (error) {
      throw mapProductMutationError(error);
    }
  }),
);

export { productsRouter };
