import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "./AuthContext";

export interface SaleItem {
  productId: string;
  salePrice: number;
}

export interface SalesContent {
  enabled: boolean;
  title: string;
  description: string;
  saleItems: SaleItem[];
}

interface SalesContextType {
  sales: SalesContent;
  isLive: boolean;
  isLoading: boolean;
  updateSales: (sales: SalesContent) => Promise<void>;
  refreshSales: () => Promise<void>;
  getSalePrice: (productId: string, originalPrice: number) => number | null;
  isProductOnSale: (productId: string) => boolean;
}

const defaultSales: SalesContent = {
  enabled: false,
  title: "Sales",
  description: "Limited-time ponytail offers selected by Dees_ponytails.",
  saleItems: [],
};

const SalesContext = createContext<SalesContextType | undefined>(undefined);
let salesCache: SalesContent | null = null;
let salesRequest: Promise<SalesContent> | null = null;

const normalizeSales = (
  payload:
    | {
        title: string;
        description: string;
        isEnabled: boolean;
        items: Array<{ productId: string; salePrice: number }>;
      }
    | null
    | undefined,
): SalesContent => ({
  enabled: payload?.isEnabled ?? false,
  title: payload?.title ?? defaultSales.title,
  description: payload?.description ?? defaultSales.description,
  saleItems: payload?.items?.map((item) => ({
    productId: item.productId,
    salePrice: item.salePrice,
  })) ?? [],
});

const fetchSales = async () => {
  if (salesCache) {
    return salesCache;
  }

  if (!salesRequest) {
    salesRequest = apiRequest<{
      items: Array<{
        title: string;
        description: string;
        isEnabled: boolean;
        items: Array<{ productId: string; salePrice: number }>;
      }>;
    }>("/sales")
      .then((response) => {
        const normalized = normalizeSales(response.items[0]);
        salesCache = normalized;
        return normalized;
      })
      .finally(() => {
        salesRequest = null;
      });
  }

  return salesRequest;
};

export const SalesProvider = ({ children }: { children: React.ReactNode }) => {
  const { accessToken } = useAuth();
  const [sales, setSales] = useState<SalesContent>(defaultSales);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSales = async () => {
    setIsLoading(true);
    try {
      salesCache = null;
      const nextSales = await fetchSales();
      setSales(nextSales);
    } catch {
      setSales(defaultSales);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const nextSales = await fetchSales();
        if (isMounted) {
          setSales(nextSales);
        }
      } catch {
        if (isMounted) {
          setSales(defaultSales);
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

  const value = useMemo<SalesContextType>(
    () => ({
      sales,
      isLoading,
      isLive: sales.enabled && sales.saleItems.some((item) => item.salePrice > 0),
      updateSales: async (nextSales) => {
        if (!accessToken) {
          throw new Error("Admin authentication is required");
        }

        const response = await apiRequest<{
          item: {
            title: string;
            description: string;
            isEnabled: boolean;
            items: Array<{ productId: string; salePrice: number }>;
          };
        }>("/sales", {
          method: "POST",
          token: accessToken,
          body: JSON.stringify({
            title: nextSales.title,
            description: nextSales.description,
            isEnabled: nextSales.enabled,
            items: nextSales.saleItems,
          }),
        });

        const normalizedSales = normalizeSales(response.item);
        salesCache = normalizedSales;
        setSales(normalizedSales);
      },
      refreshSales,
      getSalePrice: (productId, originalPrice) => {
        if (!sales.enabled) return null;
        const saleItem = sales.saleItems.find((item) => item.productId === productId);
        if (!saleItem || saleItem.salePrice <= 0 || saleItem.salePrice >= originalPrice) {
          return null;
        }
        return saleItem.salePrice;
      },
      isProductOnSale: (productId) =>
        sales.enabled &&
        sales.saleItems.some((item) => item.productId === productId && item.salePrice > 0),
    }),
    [accessToken, isLoading, sales],
  );

  return <SalesContext.Provider value={value}>{children}</SalesContext.Provider>;
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error("useSales must be used within SalesProvider");
  }

  return context;
};
