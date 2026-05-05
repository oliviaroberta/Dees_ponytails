import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API_BASE_URL, apiRequest } from "@/lib/api";
import type { CatalogProduct, CatalogProductInput } from "@/types/product";
import { useAuth } from "./AuthContext";

export type AdminProduct = CatalogProduct;
export type AdminProductInput = CatalogProductInput;

interface AdminProductsContextType {
  products: CatalogProduct[];
  isLoading: boolean;
  error: string | null;
  uploadProductImage: (file: File) => Promise<string>;
  addProduct: (product: CatalogProductInput) => Promise<void>;
  updateProduct: (id: string, updates: CatalogProductInput) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => CatalogProduct | undefined;
  refreshProducts: () => Promise<void>;
}

interface BackendProduct {
  id: string;
  slug: string;
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
  status: "IN_STOCK" | "OUT_OF_STOCK";
}

const AdminProductsContext = createContext<AdminProductsContextType | undefined>(undefined);
let productsCache: CatalogProduct[] | null = null;
let productsRequest: Promise<CatalogProduct[]> | null = null;
const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, "");

const toFrontendStatus = (status: BackendProduct["status"]) =>
  status === "IN_STOCK" ? "inStock" : "outOfStock";

const toBackendStatus = (status: CatalogProduct["status"]) =>
  status === "inStock" ? "IN_STOCK" : "OUT_OF_STOCK";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeProductImage = (image: string) => {
  const trimmed = image.trim();

  if (trimmed.startsWith("/uploads/")) {
    return `${BACKEND_BASE_URL}${trimmed}`;
  }

  if (
    trimmed.startsWith("http://localhost:4000/uploads/") ||
    trimmed.startsWith("https://localhost:4000/uploads/")
  ) {
    return trimmed.replace(/^https?:\/\/localhost:4000/, BACKEND_BASE_URL);
  }

  return trimmed;
};

const mapProduct = (product: BackendProduct): CatalogProduct => ({
  id: product.id,
  name: product.name,
  image: normalizeProductImage(product.image),
  category: product.category,
  textureStyle: product.textureStyle,
  length: product.length,
  color: product.color,
  stock: product.stock,
  price: product.price,
  description: product.description,
  featured: product.featured,
  status: toFrontendStatus(product.status),
});

const fetchProducts = async () => {
  if (productsCache) {
    return productsCache;
  }

  if (!productsRequest) {
    productsRequest = apiRequest<{ items: BackendProduct[] }>("/products")
      .then((response) => {
        const mapped = response.items.map(mapProduct);
        productsCache = mapped;
        return mapped;
      })
      .finally(() => {
        productsRequest = null;
      });
  }

  return productsRequest;
};

export const AdminProductsProvider = ({ children }: { children: React.ReactNode }) => {
  const { accessToken } = useAuth();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      productsCache = null;
      const nextProducts = await fetchProducts();
      setProducts(nextProducts);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const nextProducts = await fetchProducts();
        if (isMounted) {
          setProducts(nextProducts);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load products");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AdminProductsContextType>(
    () => ({
      products,
      isLoading,
      error,
      uploadProductImage: async (file) => {
        if (!accessToken) {
          throw new Error("Admin authentication is required");
        }

        const formData = new FormData();
        formData.append("image", file);

        const response = await apiRequest<{ imageUrl: string }>("/uploads/product-image", {
          method: "POST",
          token: accessToken,
          body: formData,
        });

        return response.imageUrl;
      },
      addProduct: async (product) => {
        if (!accessToken) {
          throw new Error("Admin authentication is required");
        }

        const response = await apiRequest<{ item: BackendProduct }>("/products", {
          method: "POST",
          token: accessToken,
          body: JSON.stringify({
            ...product,
            slug: slugify(product.name),
            status: toBackendStatus(product.status),
          }),
        });

        const nextProduct = mapProduct(response.item);
        setProducts((current) => {
          const nextProducts = [...current, nextProduct];
          productsCache = nextProducts;
          return nextProducts;
        });
      },
      updateProduct: async (id, updates) => {
        if (!accessToken) {
          throw new Error("Admin authentication is required");
        }

        const response = await apiRequest<{ item: BackendProduct }>(`/products/${id}`, {
          method: "PATCH",
          token: accessToken,
          body: JSON.stringify({
            ...updates,
            slug: slugify(updates.name),
            status: toBackendStatus(updates.status),
          }),
        });

        setProducts((current) => {
          const nextProducts = current.map((product) =>
            product.id === id ? mapProduct(response.item) : product,
          );
          productsCache = nextProducts;
          return nextProducts;
        });
      },
      deleteProduct: async (id) => {
        if (!accessToken) {
          throw new Error("Admin authentication is required");
        }

        await apiRequest(`/products/${id}`, {
          method: "DELETE",
          token: accessToken,
        });

        setProducts((current) => {
          const nextProducts = current.filter((product) => product.id !== id);
          productsCache = nextProducts;
          return nextProducts;
        });
      },
      getProductById: (id) => products.find((product) => product.id === id),
      refreshProducts,
    }),
    [accessToken, error, isLoading, products],
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
