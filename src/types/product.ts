export type ProductStatus = "inStock" | "outOfStock";

export interface CatalogProduct {
  id: string;
  name: string;
  image: string;
  category: string;
  textureStyle: string;
  length: string;
  color: string;
  stock: number;
  price: number;
  description: string;
  featured: boolean;
  status: ProductStatus;
}

export type CatalogProductInput = Omit<CatalogProduct, "id">;
