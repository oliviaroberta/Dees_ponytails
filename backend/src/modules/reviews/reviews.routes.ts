import { Router } from "express";
import { Product, Review } from "../../models/index.js";
import { requireAdmin } from "../../middleware/require-admin.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { AppError } from "../../utils/app-error.js";
import { serializeReview } from "../../utils/serializers.js";
import { reviewBodySchema, reviewQuerySchema, reviewStatusSchema } from "./reviews.schemas.js";

const reviewsRouter = Router();

const getRouteParam = (value: string | string[]) => (Array.isArray(value) ? value[0] : value);

reviewsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = reviewQuerySchema.parse(req.query);
    const where: Record<string, unknown> = {};

    if (query.productId) {
      where.productId = query.productId;
    } else {
      where.status = query.status ?? "APPROVED";
    }

    if (query.status) {
      where.status = query.status;
    }

    const reviews = await Review.findAll({
      where,
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      items: reviews.map(serializeReview),
      count: reviews.length,
    });
  }),
);

reviewsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = reviewBodySchema.parse(req.body);
    const product = await Product.findByPk(payload.productId);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const review = await Review.create({
      ...payload,
      status: "PENDING",
    });

    res.status(201).json({
      message: "Review submitted successfully",
      item: serializeReview(review),
    });
  }),
);

reviewsRouter.patch(
  "/:id/status",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = reviewStatusSchema.parse(req.body);
    const review = await Review.findByPk(getRouteParam(req.params.id));

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    await review.update({ status: payload.status });

    res.json({
      message: "Review status updated successfully",
      item: serializeReview(review),
    });
  }),
);

reviewsRouter.delete(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const review = await Review.findByPk(getRouteParam(req.params.id));

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    await review.destroy();

    res.json({
      message: "Review deleted successfully",
    });
  }),
);

export { reviewsRouter };
