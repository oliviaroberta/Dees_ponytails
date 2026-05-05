import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

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

interface LegacySalesContent {
  enabled?: boolean;
  title?: string;
  description?: string;
  productIds?: string[];
}

interface SalesContextType {
  sales: SalesContent;
  isLive: boolean;
  updateSales: (sales: SalesContent) => void;
  getSalePrice: (productId: string, originalPrice: number) => number | null;
  isProductOnSale: (productId: string) => boolean;
}

const STORAGE_KEY = "dees_sales_content";

const defaultSales: SalesContent = {
  enabled: false,
  title: "Sales",
  description: "Limited-time ponytail offers selected by Dees_ponytails.",
  saleItems: [],
};

const normalizeSales = (
  saved: Partial<SalesContent> | LegacySalesContent | null | undefined,
): SalesContent => {
  const rawSaleItems = Array.isArray((saved as Partial<SalesContent>)?.saleItems)
    ? (saved as Partial<SalesContent>).saleItems
    : [];
  const legacyProductIds = Array.isArray((saved as LegacySalesContent)?.productIds)
    ? (saved as LegacySalesContent).productIds
    : [];

  const saleItems =
    rawSaleItems.length > 0
      ? rawSaleItems
          .filter((item): item is SaleItem => !!item && !!item.productId)
          .map((item) => ({
            productId: item.productId,
            salePrice: typeof item.salePrice === "number" ? item.salePrice : 0,
          }))
      : legacyProductIds.filter(Boolean).map((productId) => ({ productId, salePrice: 0 }));

  return {
    enabled: typeof saved?.enabled === "boolean" ? saved.enabled : defaultSales.enabled,
    title: saved?.title || defaultSales.title,
    description: saved?.description || defaultSales.description,
    saleItems,
  };
};

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider = ({ children }: { children: React.ReactNode }) => {
  const [sales, setSales] = useState<SalesContent>(() => {
    if (typeof window === "undefined") return defaultSales;

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultSales;

    try {
      return normalizeSales(
        JSON.parse(saved) as Partial<SalesContent> | LegacySalesContent,
      );
    } catch {
      return defaultSales;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
  }, [sales]);

  const value = useMemo<SalesContextType>(
    () => ({
      sales,
      isLive: sales.enabled && sales.saleItems.some((item) => item.salePrice > 0),
      updateSales: setSales,
      getSalePrice: (productId, originalPrice) => {
        if (!sales.enabled) return null;

        const saleItem = sales.saleItems.find((item) => item.productId === productId);
        if (!saleItem) return null;
        if (saleItem.salePrice <= 0) return null;
        if (saleItem.salePrice >= originalPrice) return null;

        return saleItem.salePrice;
      },
      isProductOnSale: (productId) =>
        sales.enabled &&
        sales.saleItems.some((item) => item.productId === productId && item.salePrice > 0),
    }),
    [sales],
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
