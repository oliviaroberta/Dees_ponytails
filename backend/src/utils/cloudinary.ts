import crypto from "node:crypto";
import { env } from "../config/env.js";
import { AppError } from "./app-error.js";

const CLOUDINARY_FOLDER = env.CLOUDINARY_UPLOAD_FOLDER || "dees-ponytails/products";

export const isCloudinaryConfigured = () =>
  !!env.CLOUDINARY_CLOUD_NAME &&
  !!env.CLOUDINARY_API_KEY &&
  !!env.CLOUDINARY_API_SECRET &&
  env.CLOUDINARY_CLOUD_NAME !== "your_cloud_name" &&
  env.CLOUDINARY_API_KEY !== "your_cloudinary_api_key" &&
  env.CLOUDINARY_API_SECRET !== "your_cloudinary_api_secret";

const uploadToCloudinary = async ({
  buffer,
  mimeType,
  fileName,
  resourceType,
}: {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
  resourceType: "image" | "video";
}) => {
  if (!isCloudinaryConfigured()) {
    throw new AppError("Cloudinary is not configured", 503);
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = fileName.replace(/\.[a-z0-9]+$/i, "");
  const signatureBase = `folder=${CLOUDINARY_FOLDER}&public_id=${publicId}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash("sha1").update(signatureBase).digest("hex");
  const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;
  const formData = new FormData();

  formData.append("file", dataUri);
  formData.append("api_key", env.CLOUDINARY_API_KEY!);
  formData.append("timestamp", timestamp.toString());
  formData.append("folder", CLOUDINARY_FOLDER);
  formData.append("public_id", publicId);
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const payload = (await response.json()) as {
    secure_url?: string;
    error?: { message?: string };
  };

  if (!response.ok || !payload.secure_url) {
    throw new AppError(payload.error?.message || `Cloud ${resourceType} upload failed`, 502);
  }

  return payload.secure_url;
};

export const uploadImageToCloudinary = (payload: {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
}) => uploadToCloudinary({ ...payload, resourceType: "image" });

export const uploadVideoToCloudinary = (payload: {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
}) => uploadToCloudinary({ ...payload, resourceType: "video" });
