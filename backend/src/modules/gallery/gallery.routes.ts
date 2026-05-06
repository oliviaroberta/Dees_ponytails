import { Router } from "express";
import { GalleryItem } from "../../models/index.js";
import { requireAdmin } from "../../middleware/require-admin.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { AppError } from "../../utils/app-error.js";
import { serializeGalleryItem } from "../../utils/serializers.js";
import {
  galleryCreateSchema,
  galleryQuerySchema,
  galleryUpdateSchema,
} from "./gallery.schemas.js";

const galleryRouter = Router();
const getRouteParam = (value: string | string[]) => (Array.isArray(value) ? value[0] : value);

const normalizeOptionalText = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

galleryRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = galleryQuerySchema.parse(req.query);
    const where: Record<string, unknown> = {};

    if (query.published !== "all") {
      where.isPublished = query.published === "true";
    }

    if (query.mediaType) {
      where.mediaType = query.mediaType;
    }

    const items = await GalleryItem.findAll({
      where,
      order: [
        ["sortOrder", "ASC"],
        ["createdAt", "DESC"],
      ],
    });

    res.json({
      items: items.map(serializeGalleryItem),
      count: items.length,
    });
  }),
);

galleryRouter.post(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = galleryCreateSchema.parse(req.body);

    const item = await GalleryItem.create({
      mediaType: payload.mediaType,
      mediaUrl: payload.mediaUrl,
      customerName: normalizeOptionalText(payload.customerName),
      caption: normalizeOptionalText(payload.caption),
      isPublished: payload.isPublished,
      sortOrder: payload.sortOrder,
    });

    res.status(201).json({
      message: "Gallery item created successfully",
      item: serializeGalleryItem(item),
    });
  }),
);

galleryRouter.patch(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = galleryUpdateSchema.parse(req.body);
    const item = await GalleryItem.findByPk(getRouteParam(req.params.id));

    if (!item) {
      throw new AppError("Gallery item not found", 404);
    }

    await item.update({
      ...(payload.mediaType ? { mediaType: payload.mediaType } : {}),
      ...(payload.mediaUrl ? { mediaUrl: payload.mediaUrl } : {}),
      ...(payload.customerName !== undefined
        ? { customerName: normalizeOptionalText(payload.customerName) }
        : {}),
      ...(payload.caption !== undefined ? { caption: normalizeOptionalText(payload.caption) } : {}),
      ...(payload.isPublished !== undefined ? { isPublished: payload.isPublished } : {}),
      ...(payload.sortOrder !== undefined ? { sortOrder: payload.sortOrder } : {}),
    });

    res.json({
      message: "Gallery item updated successfully",
      item: serializeGalleryItem(item),
    });
  }),
);

galleryRouter.delete(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const item = await GalleryItem.findByPk(getRouteParam(req.params.id));

    if (!item) {
      throw new AppError("Gallery item not found", 404);
    }

    await item.destroy();
    res.status(204).send();
  }),
);

export { galleryRouter };
