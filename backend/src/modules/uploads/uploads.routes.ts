import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { requireAdmin } from "../../middleware/require-admin.js";
import { createRateLimit } from "../../middleware/rate-limit.js";
import { AppError } from "../../utils/app-error.js";
import { isCloudinaryConfigured, uploadImageToCloudinary } from "../../utils/cloudinary.js";

const uploadsRouter = Router();
const uploadDir = path.join(process.cwd(), "uploads", "products");
const adminUploadRateLimit = createRateLimit({
  keyPrefix: "uploads:product-image",
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: "Too many image uploads. Please wait a moment and try again.",
});

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDir);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase() || ".jpg";
    const baseName = path
      .basename(file.originalname, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50);

    callback(null, `${baseName || "product"}-${Date.now()}${extension}`);
  },
});

const upload = multer({
  storage,
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

uploadsRouter.post(
  "/product-image",
  requireAdmin,
  adminUploadRateLimit,
  upload.single("image"),
  async (req, res) => {
    if (!req.file) {
      throw new AppError("Image file is required", 400);
    }

    const localFilePath = path.join(uploadDir, req.file.filename);
    const imageUrl = isCloudinaryConfigured()
      ? await uploadImageToCloudinary({
          buffer: fs.readFileSync(localFilePath),
          mimeType: req.file.mimetype,
          fileName: req.file.filename,
        })
      : `/uploads/products/${req.file.filename}`;

    if (isCloudinaryConfigured()) {
      try {
        fs.unlinkSync(localFilePath);
      } catch {
        // Ignore cleanup errors after a successful cloud upload.
      }
    }

    res.status(201).json({
      message: "Image uploaded successfully",
      imageUrl,
      fileName: req.file.filename,
    });
  },
);

export { uploadsRouter };
