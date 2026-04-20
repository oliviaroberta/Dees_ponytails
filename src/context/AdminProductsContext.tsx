import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { seedProducts } from "@/data/products";
import type { CatalogProduct, CatalogProductInput, ProductStatus } from "@/types/product";

export type AdminProduct = CatalogProduct;
export type AdminProductInput = CatalogProductInput;

interface AdminProductsContextType {
  products: CatalogProduct[];
  addProduct: (product: CatalogProductInput) => void;
  updateProduct: (id: string, updates: CatalogProductInput) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => CatalogProduct | undefined;
}

const STORAGE_KEY = "dees_admin_products";

const defaultProducts: CatalogProduct[] = seedProducts.map((product, index) => ({
  id: `seed-${index + 1}`,
  ...product,
}));

const AdminProductsContext = createContext<AdminProductsContextType | undefined>(undefined);

export const AdminProductsProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<CatalogProduct[]>(() => {
    if (typeof window === "undefined") {
      return defaultProducts;
    }

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return defaultProducts;
    }

    try {
      return JSON.parse(saved) as CatalogProduct[];
    } catch {
      return defaultProducts;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const value = useMemo(
    () => ({
      products,
      addProduct: (product) => {
        setProducts((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            ...product,
          },
        ]);
      },
      updateProduct: (id, updates) => {
        setProducts((current) =>
          current.map((product) => (product.id === id ? { id, ...updates } : product)),
        );
      },
      deleteProduct: (id) => {
        setProducts((current) => current.filter((product) => product.id !== id));
      },
      getProductById: (id) => products.find((product) => product.id === id),
    }),
    [products],
  );

  return <AdminProductsContext.Provider value={value}>{children}</AdminProductsContext.Provider>;
};

export const useAdminProducts = () => {
  const context = useContext(AdminProductsContext);
  if (!context) {
    throw new Error("useAdminProducts must be used within AdminProductsProvider");
  }

  return context;
};
