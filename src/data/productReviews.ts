export interface ProductReview {
  name: string;
  text: string;
  rating: number;
}

const straightReviews: ProductReview[] = [
  { name: "Ama K.", text: "This straight ponytail looks sleek and polished every single time.", rating: 5 },
  { name: "Mimi A.", text: "The straight texture is so neat and soft. It gives a clean luxury finish.", rating: 5 },
];

const bodyWaveReviews: ProductReview[] = [
  { name: "Nana A.", text: "The body wave has the perfect bounce. It blends beautifully with my hair.", rating: 5 },
  { name: "Ella D.", text: "Soft waves, good fullness, and the ponytail still feels light to wear.", rating: 5 },
];

const deepCurlReviews: ProductReview[] = [
  { name: "Akosua B.", text: "The deep curl ponytail is full, defined, and so pretty in person.", rating: 5 },
  { name: "Efua M.", text: "I wore the curly one to an event and everyone kept asking where I got it.", rating: 5 },
];

const naturalTextureReviews: ProductReview[] = [
  { name: "Joan S.", text: "This natural texture blends so well and looks very realistic.", rating: 5 },
  { name: "Dede A.", text: "Perfect for a fuller textured look. It does not look fake at all.", rating: 5 },
];

export const getProductReviews = (productName: string) => {
  const key = productName.toLowerCase();

  if (key.includes("straight")) return straightReviews;
  if (key.includes("wave")) return bodyWaveReviews;
  if (key.includes("curl")) return deepCurlReviews;

  return naturalTextureReviews;
};
