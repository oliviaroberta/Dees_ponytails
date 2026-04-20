import productStraight from "@/assets/product-straight.jpg";
import productBodywave from "@/assets/product-bodywave.jpg";
import productCurly from "@/assets/product-curly.jpg";
import productKinky from "@/assets/product-kinky.jpg";
import type { CatalogProductInput } from "@/types/product";

export const seedProducts: CatalogProductInput[] = [
  {
    name: "Sleek Straight Ponytail",
    image: productStraight,
    category: "Ponytail Extension",
    textureStyle: "Straight",
    length: '22"',
    color: "Natural Black",
    stock: 12,
    price: 150,
    description: "Ultra-smooth, silky straight ponytail extension for a polished, elegant look.",
    featured: true,
    status: "inStock",
  },
  {
    name: "Body Wave Ponytail",
    image: productBodywave,
    category: "Ponytail Extension",
    textureStyle: "Body Wave",
    length: '22"',
    color: "Natural Black",
    stock: 10,
    price: 160,
    description: "Soft, flowing body wave texture that adds natural volume and movement.",
    featured: true,
    status: "inStock",
  },
  {
    name: "Deep Curl Ponytail",
    image: productCurly,
    category: "Ponytail Extension",
    textureStyle: "Deep Curl",
    length: '24"',
    color: "Natural Black",
    stock: 8,
    price: 165,
    description: "Gorgeous deep curls for a glamorous, bouncy ponytail statement.",
    featured: true,
    status: "inStock",
  },
  {
    name: "Natural Texture Ponytail",
    image: productKinky,
    category: "Ponytail Extension",
    textureStyle: "Kinky Straight",
    length: '24"',
    color: "Natural Black",
    stock: 6,
    price: 170,
    description: "Beautiful natural texture that blends seamlessly with afro-textured hair.",
    featured: false,
    status: "inStock",
  },
];

export const products = seedProducts;
