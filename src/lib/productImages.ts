import productStraight from "@/assets/Neutral Simple Coming Soon Instagram Post 2.PNG";
import productBodywave from "@/assets/Neutral Simple Coming Soon Instagram Post 5.PNG";
import productCurly from "@/assets/Neutral Simple Coming Soon Instagram Post 3.PNG";
import productKinky from "@/assets/Neutral Simple Coming Soon Instagram Post.PNG";

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
