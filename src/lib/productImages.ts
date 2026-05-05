import productStraight from "@/assets/product-straight-new-optimized.jpg";
import productBodywave from "@/assets/product-body-wave-optimized.jpg";
import productCurly from "@/assets/product-deep-curl-optimized.jpg";
import productKinky from "@/assets/product-natural-texture-optimized.jpg";
import { API_BASE_URL } from "@/lib/api";

const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, "");

export const getProductImage = (name: string, image?: string) => {
  const trimmed = image?.trim();

  if (trimmed) {
    if (
      trimmed.startsWith("blob:") ||
      trimmed.startsWith("data:")
    ) {
      return trimmed;
    }

    if (
      trimmed.startsWith("http://localhost:4000/uploads/") ||
      trimmed.startsWith("https://localhost:4000/uploads/")
    ) {
      return trimmed.replace(/^https?:\/\/localhost:4000/, BACKEND_BASE_URL);
    }

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }

    if (trimmed.startsWith("/uploads/")) {
      return `${BACKEND_BASE_URL}${trimmed}`;
    }

    if (!trimmed.startsWith("/images/")) {
      return trimmed;
    }
  }

  const key = name.toLowerCase();

  if (key.includes("straight")) return productStraight;
  if (key.includes("wave")) return productBodywave;
  if (key.includes("curl")) return productCurly;

  return productKinky;
};
