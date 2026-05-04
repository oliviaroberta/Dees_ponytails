import productStraight from "@/assets/product-straight-new.png";
import productBodywave from "@/assets/product-body-wave.png";
import productCurly from "@/assets/product-deep-curl.png";
import productKinky from "@/assets/product-natural-texture.png";

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
