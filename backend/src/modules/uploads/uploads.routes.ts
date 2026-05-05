import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { requireAdmin } from "../../middleware/require-admin.js";
import { AppError } from "../../utils/app-error.js";

const uploadsRouter = Router();
const uploadDir = path.join(process.cwd(), "uploads", "products");

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
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      throw new AppError("Image file is required", 400);
    }

    const imageUrl = `/uploads/products/${req.file.filename}`;

    res.status(201).json({
      message: "Image uploaded successfully",
      imageUrl,
      fileName: req.file.filename,
    });
  },
);

export { uploadsRouter };
