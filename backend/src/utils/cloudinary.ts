import crypto from "node:crypto";
import { env } from "../config/env.js";
import { AppError } from "./app-error.js";

const CLOUDINARY_FOLDER = env.CLOUDINARY_UPLOAD_FOLDER || "dees-ponytails/products";

type CloudinaryResourceType = "image" | "video";

export const isCloudinaryConfigured = () =>
  !!env.CLOUDINARY_CLOUD_NAME &&
  !!env.CLOUDINARY_API_KEY &&
  !!env.CLOUDINARY_API_SECRET &&
  env.CLOUDINARY_CLOUD_NAME !== "your_cloud_name" &&
  env.CLOUDINARY_API_KEY !== "your_cloudinary_api_key" &&
  env.CLOUDINARY_API_SECRET !== "your_cloudinary_api_secret";

const buildSignedUploadPayload = ({
  fileName,
  resourceType,
}: {
  fileName: string;
  resourceType: CloudinaryResourceType;
}) => {
  if (!isCloudinaryConfigured()) {
    throw new AppError("Cloudinary is not configured", 503);
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = fileName.replace(/\.[a-z0-9]+$/i, "");
  const signatureBase = `folder=${CLOUDINARY_FOLDER}&public_id=${publicId}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash("sha1").update(signatureBase).digest("hex");

  return {
    apiKey: env.CLOUDINARY_API_KEY!,
    cloudName: env.CLOUDINARY_CLOUD_NAME!,
    folder: CLOUDINARY_FOLDER,
    publicId,
    resourceType,
    signature,
    timestamp,
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
  };
};

const uploadToCloudinary = async ({
  buffer,
  mimeType,
  fileName,
  resourceType,
}: {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
  resourceType: CloudinaryResourceType;
}) => {
  const signedPayload = buildSignedUploadPayload({ fileName, resourceType });
  const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;
  const formData = new FormData();

  formData.append("file", dataUri);
  formData.append("api_key", signedPayload.apiKey);
  formData.append("timestamp", signedPayload.timestamp.toString());
  formData.append("folder", signedPayload.folder);
  formData.append("public_id", signedPayload.publicId);
  formData.append("signature", signedPayload.signature);

  const response = await fetch(signedPayload.uploadUrl, {
    method: "POST",
    body: formData,
  });

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

export const createCloudinaryUploadSignature = (payload: {
  fileName: string;
  resourceType: CloudinaryResourceType;
}) => buildSignedUploadPayload(payload);
