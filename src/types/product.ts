export type ProductStatus = "inStock" | "outOfStock" | "archived" | "draft";

export const PUBLIC_PRODUCT_STATUSES: ProductStatus[] = ["inStock", "outOfStock"];

export const getProductStatusLabel = (status: ProductStatus) => {
  switch (status) {
    case "inStock":
      return "In Stock";
    case "outOfStock":
      return "Out of Stock";
    case "archived":
      return "Archived";
    case "draft":
      return "Draft";
  }
};

export const isStorefrontVisibleStatus = (status: ProductStatus) =>
  PUBLIC_PRODUCT_STATUSES.includes(status);

export const isPurchasableStatus = (status: ProductStatus) => status === "inStock";

export interface CatalogProduct {
  id: string;
  name: string;
  image: string;
  video: string | null;
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
