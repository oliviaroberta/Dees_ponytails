import productStraight from "@/assets/product-straight-new-optimized.jpg";
import productBodywave from "@/assets/product-body-wave-optimized.jpg";
import productCurly from "@/assets/product-deep-curl-optimized.jpg";
import productKinky from "@/assets/product-natural-texture-optimized.jpg";

export const getProductImage = (name: string, image?: string) => {
  if (image?.trim()) {
    return image;
  }

  const key = name.toLowerCase();

  if (key.includes("straight")) return productStraight;
  if (key.includes("wave")) return productBodywave;
  if (key.includes("curl")) return productCurly;

  return productKinky;
};
