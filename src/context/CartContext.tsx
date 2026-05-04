import React, { createContext, useContext, useState, useCallback } from "react";

export interface CartItem {
  lineId: string;
  id: string;
  name: string;
  texture: string;
  color: string;
  length: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity" | "lineId">) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  total: number;
  itemCount: number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((newItem: Omit<CartItem, "quantity" | "lineId">) => {
    setItems((prev) => {
      const lineId = `${newItem.id}::${newItem.color}::${newItem.length}`;
      const existing = prev.find((i) => i.lineId === lineId);
      if (existing) {
        return prev.map((i) => i.lineId === lineId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...newItem, lineId, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((lineId: string) => {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.lineId !== lineId));
    } else {
      setItems((prev) => prev.map((i) => i.lineId === lineId ? { ...i, quantity } : i));
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, isOpen, setIsOpen, addItem, removeItem, updateQuantity, total, itemCount, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
