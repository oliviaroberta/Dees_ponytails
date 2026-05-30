import { Router } from "express";
import multer from "multer";
import { requireAdmin } from "../../middleware/require-admin.js";
import { createRateLimit } from "../../middleware/rate-limit.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { AppError } from "../../utils/app-error.js";
import {
  isCloudinaryConfigured,
  uploadImageToCloudinary,
  uploadVideoToCloudinary,
} from "../../utils/cloudinary.js";

const uploadsRouter = Router();
const adminUploadRateLimit = createRateLimit({
  keyPrefix: "uploads:product-media",
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: "Too many media uploads. Please wait a moment and try again.",
});

const buildUploadFileName = (originalName: string) => {
  const extensionMatch = originalName.match(/(\.[a-z0-9]+)$/i);
  const extension = extensionMatch?.[1]?.toLowerCase() || ".bin";
  const baseName = originalName
    .replace(/\.[a-z0-9]+$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

  return `${baseName || "product"}-${Date.now()}${extension}`;
};

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new AppError("Only image uploads are allowed", 400));
      return;
    }

    callback(null, true);
  },
});

const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 30 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("video/")) {
      callback(new AppError("Only video uploads are allowed", 400));
      return;
    }

    callback(null, true);
  },
});

uploadsRouter.post(
  "/product-image",
  requireAdmin,
  adminUploadRateLimit,
  imageUpload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError("Image file is required", 400);
    }
    if (!isCloudinaryConfigured()) {
      throw new AppError("Cloudinary is not configured", 503);
    }

    const fileName = buildUploadFileName(req.file.originalname);
    const imageUrl = await uploadImageToCloudinary({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      fileName,
    });

    res.status(201).json({
      message: "Image uploaded successfully",
      imageUrl,
      fileName,
    });
  }),
);

uploadsRouter.post(
  "/product-video",
  requireAdmin,
  adminUploadRateLimit,
  videoUpload.single("video"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError("Video file is required", 400);
    }
    if (!isCloudinaryConfigured()) {
      throw new AppError("Cloudinary is not configured", 503);
    }

    const fileName = buildUploadFileName(req.file.originalname);
    const videoUrl = await uploadVideoToCloudinary({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      fileName,
    });

    res.status(201).json({
      message: "Video uploaded successfully",
      videoUrl,
      fileName,
    });
  }),
);

export { uploadsRouter };
