import fs from "node:fs";
import path from "node:path";
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
const productImageDir = path.join(process.cwd(), "uploads", "products");
const productVideoDir = path.join(process.cwd(), "uploads", "videos");
const shouldUseCloudinary = isCloudinaryConfigured();
const adminUploadRateLimit = createRateLimit({
  keyPrefix: "uploads:product-media",
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: "Too many media uploads. Please wait a moment and try again.",
});

if (!shouldUseCloudinary) {
  fs.mkdirSync(productImageDir, { recursive: true });
  fs.mkdirSync(productVideoDir, { recursive: true });
}

const buildStorage = (destinationDir: string) =>
  multer.diskStorage({
    destination: (_req, _file, callback) => {
      callback(null, destinationDir);
    },
    filename: (_req, file, callback) => {
      callback(null, buildUploadFileName(file.originalname));
    },
  });

const buildUploadStorage = (destinationDir: string) =>
  shouldUseCloudinary ? multer.memoryStorage() : buildStorage(destinationDir);

const buildUploadFileName = (originalName: string) => {
  const extension = path.extname(originalName).toLowerCase() || ".bin";
  const baseName = path
    .basename(originalName, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

  return `${baseName || "product"}-${Date.now()}${extension}`;
};

const imageUpload = multer({
  storage: buildUploadStorage(productImageDir),
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
  storage: buildUploadStorage(productVideoDir),
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

const removeLocalFile = (filePath: string) => {
  try {
    fs.unlinkSync(filePath);
  } catch {
    // Ignore cleanup errors after a successful cloud upload.
  }
};

const getUploadBuffer = (file: Express.Multer.File, localDir: string) => {
  if (file.buffer) {
    return file.buffer;
  }

  return fs.readFileSync(path.join(localDir, file.filename));
};

uploadsRouter.post(
  "/product-image",
  requireAdmin,
  adminUploadRateLimit,
  imageUpload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError("Image file is required", 400);
    }

    const fileName = req.file.filename || buildUploadFileName(req.file.originalname);
    const localFilePath = req.file.filename ? path.join(productImageDir, req.file.filename) : null;
    const imageUrl = shouldUseCloudinary
      ? await uploadImageToCloudinary({
          buffer: getUploadBuffer(req.file, productImageDir),
          mimeType: req.file.mimetype,
          fileName,
        })
      : `/uploads/products/${req.file.filename}`;

    if (shouldUseCloudinary && localFilePath && fs.existsSync(localFilePath)) {
      removeLocalFile(localFilePath);
    }

    res.status(201).json({
      message: "Image uploaded successfully",
      imageUrl,
      fileName: req.file.filename,
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

    const fileName = req.file.filename || buildUploadFileName(req.file.originalname);
    const localFilePath = req.file.filename ? path.join(productVideoDir, req.file.filename) : null;
    const videoUrl = shouldUseCloudinary
      ? await uploadVideoToCloudinary({
          buffer: getUploadBuffer(req.file, productVideoDir),
          mimeType: req.file.mimetype,
          fileName,
        })
      : `/uploads/videos/${req.file.filename}`;

    if (shouldUseCloudinary && localFilePath && fs.existsSync(localFilePath)) {
      removeLocalFile(localFilePath);
    }

    res.status(201).json({
      message: "Video uploaded successfully",
      videoUrl,
      fileName: req.file.filename,
    });
  }),
);

export { uploadsRouter };
