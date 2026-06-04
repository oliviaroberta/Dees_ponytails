import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API_BASE_URL, apiRequest, uploadCloudinaryMedia } from "@/lib/api";
import { slugify } from "@/lib/strings";
import {
  PUBLIC_PRODUCT_STATUSES,
  type CatalogProduct,
  type CatalogProductInput,
  type ProductStatus,
} from "@/types/product";
import { useAuth } from "./AuthContext";

export type AdminProduct = CatalogProduct;
export type AdminProductInput = CatalogProductInput;

interface AdminProductsContextType {
  products: CatalogProduct[];
  storefrontProducts: CatalogProduct[];
  isLoading: boolean;
  error: string | null;
  uploadProductImage: (file: File) => Promise<string>;
  uploadProductVideo: (file: File) => Promise<string>;
  addProduct: (product: CatalogProductInput) => Promise<void>;
  updateProduct: (id: string, updates: CatalogProductInput) => Promise<void>;
  setProductStatus: (id: string, status: ProductStatus) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => CatalogProduct | undefined;
  refreshProducts: () => Promise<void>;
}

interface BackendProduct {
  id: string;
  slug: string;
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
  status: "IN_STOCK" | "OUT_OF_STOCK" | "ARCHIVED" | "DRAFT";
}

const AdminProductsContext = createContext<AdminProductsContextType | undefined>(undefined);
let publicProductsCache: CatalogProduct[] | null = null;
let allProductsCache: CatalogProduct[] | null = null;
let publicProductsRequest: Promise<CatalogProduct[]> | null = null;
let allProductsRequest: Promise<CatalogProduct[]> | null = null;
const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, "");

const toFrontendStatus = (status: BackendProduct["status"]): ProductStatus => {
  switch (status) {
    case "IN_STOCK":
      return "inStock";
    case "OUT_OF_STOCK":
      return "outOfStock";
    case "ARCHIVED":
      return "archived";
    case "DRAFT":
      return "draft";
  }
};

const toBackendStatus = (status: CatalogProduct["status"]) => {
  switch (status) {
    case "inStock":
      return "IN_STOCK";
    case "outOfStock":
      return "OUT_OF_STOCK";
    case "archived":
      return "ARCHIVED";
    case "draft":
      return "DRAFT";
  }
};

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

const normalizeProductVideo = (video: string | null) => {
  if (!video) {
    return null;
  }

  const trimmed = video.trim();

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
  video: normalizeProductVideo(product.video),
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

const fetchProducts = async (includeHidden: boolean) => {
  const cachedProducts = includeHidden ? allProductsCache : publicProductsCache;
  if (cachedProducts) {
    return cachedProducts;
  }

  const request = includeHidden ? allProductsRequest : publicProductsRequest;
  if (!request) {
    const nextRequest = apiRequest<{ items: BackendProduct[] }>(
      includeHidden ? "/products?visibility=all" : "/products",
    )
      .then((response) => {
        const mapped = response.items.map(mapProduct);
        if (includeHidden) {
          allProductsCache = mapped;
        } else {
          publicProductsCache = mapped;
        }
        return mapped;
      })
      .finally(() => {
        if (includeHidden) {
          allProductsRequest = null;
        } else {
          publicProductsRequest = null;
        }
      });

    if (includeHidden) {
      allProductsRequest = nextRequest;
    } else {
      publicProductsRequest = nextRequest;
    }
  }

  return includeHidden ? allProductsRequest! : publicProductsRequest!;
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
      publicProductsCache = null;
      allProductsCache = null;
      const nextProducts = await fetchProducts(!!accessToken);
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
        const nextProducts = await fetchProducts(!!accessToken);
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
  }, [accessToken]);

  const storefrontProducts = useMemo(
    () => products.filter((product) => PUBLIC_PRODUCT_STATUSES.includes(product.status)),
    [products],
  );

  const value = useMemo<AdminProductsContextType>(
    () => ({
      products,
      storefrontProducts,
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
      uploadProductVideo: async (file) => {
        if (!accessToken) {
          throw new Error("Admin authentication is required");
        }

        return uploadCloudinaryMedia({
          file,
          resourceType: "video",
          token: accessToken,
        });
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
          publicProductsCache = nextProducts.filter((product) =>
            PUBLIC_PRODUCT_STATUSES.includes(product.status),
          );
          allProductsCache = nextProducts;
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
          publicProductsCache = nextProducts.filter((product) =>
            PUBLIC_PRODUCT_STATUSES.includes(product.status),
          );
          allProductsCache = nextProducts;
          return nextProducts;
        });
      },
      setProductStatus: async (id, status) => {
        if (!accessToken) {
          throw new Error("Admin authentication is required");
        }

        const response = await apiRequest<{ item: BackendProduct }>(`/products/${id}`, {
          method: "PATCH",
          token: accessToken,
          body: JSON.stringify({
            status: toBackendStatus(status),
          }),
        });

        setProducts((current) => {
          const nextProducts = current.map((product) =>
            product.id === id ? mapProduct(response.item) : product,
          );
          publicProductsCache = nextProducts.filter((product) =>
            PUBLIC_PRODUCT_STATUSES.includes(product.status),
          );
          allProductsCache = nextProducts;
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
          publicProductsCache = nextProducts.filter((product) =>
            PUBLIC_PRODUCT_STATUSES.includes(product.status),
          );
          allProductsCache = nextProducts;
          return nextProducts;
        });
      },
      getProductById: (id) => products.find((product) => product.id === id),
      refreshProducts,
    }),
    [accessToken, error, isLoading, products, storefrontProducts],
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
