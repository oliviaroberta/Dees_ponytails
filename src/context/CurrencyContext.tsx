import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CurrencyCode = "GHS" | "USD" | "GBP" | "EUR" | "CAD" | "NGN" | "ZAR";

interface CurrencyOption {
  code: CurrencyCode;
  label: string;
  rate: number;
  locale: string;
}

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  formatPrice: (amountGhs: number) => string;
  currencyOptions: CurrencyOption[];
}

const STORAGE_KEY = "dees_currency";

const currencyOptions: CurrencyOption[] = [
  { code: "GHS", label: "Ghana Cedi", rate: 1, locale: "en-GH" },
  { code: "USD", label: "US Dollar", rate: 0.074, locale: "en-US" },
  { code: "GBP", label: "British Pound", rate: 0.059, locale: "en-GB" },
  { code: "EUR", label: "Euro", rate: 0.068, locale: "en-IE" },
  { code: "CAD", label: "Canadian Dollar", rate: 0.1, locale: "en-CA" },
  { code: "NGN", label: "Nigerian Naira", rate: 118, locale: "en-NG" },
  { code: "ZAR", label: "South African Rand", rate: 1.38, locale: "en-ZA" },
];

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    if (typeof window === "undefined") return "GHS";
    const saved = window.localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
    return currencyOptions.some((option) => option.code === saved) ? saved! : "GHS";
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, currency);
  }, [currency]);

  const value = useMemo<CurrencyContextType>(() => {
    const selected = currencyOptions.find((option) => option.code === currency) ?? currencyOptions[0];

    return {
      currency,
      setCurrency,
      currencyOptions,
      formatPrice: (amountGhs: number) =>
        new Intl.NumberFormat(selected.locale, {
          style: "currency",
          currency: selected.code,
          maximumFractionDigits: selected.code === "GHS" ? 0 : 2,
        }).format(amountGhs * selected.rate),
    };
  }, [currency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }

  return context;
};
