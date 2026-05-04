import { X, Plus, Minus, Trash2, CreditCard } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, total } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (items.length === 0) return;
    setIsOpen(false);
    navigate("/checkout");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="font-display text-xl font-semibold text-foreground">Your Cart</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {items.length === 0 ? (
                <p className="py-12 text-center font-body text-muted-foreground">
                  Your cart is empty
                </p>
              ) : (
                items.map((item) => (
                  <div key={item.lineId} className="flex gap-4 border-b border-border/50 py-3">
                    <img src={item.image} alt={item.name} className="h-16 w-16 rounded object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm font-medium text-foreground">
                        {item.name}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        {item.texture} - {item.color} - {item.length}
                      </p>
                      <p className="mt-1 font-body text-sm font-medium text-foreground">
                        GHS {item.price}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                          className="p-0.5 text-muted-foreground hover:text-foreground"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center font-body text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                          className="p-0.5 text-muted-foreground hover:text-foreground"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => removeItem(item.lineId)}
                          className="ml-auto p-0.5 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="space-y-4 border-t border-border p-5">
                <div className="flex justify-between font-body">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-lg font-semibold text-foreground">GHS {total}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="flex w-full items-center justify-center gap-2 rounded bg-accent py-3 font-body font-medium tracking-wide text-accent-foreground transition-opacity hover:opacity-90"
                >
                  <CreditCard size={18} />
                  Checkout
                </button>
                <p className="text-center font-body text-xs text-muted-foreground">
                  Mobile Money or Card - Secure in-app payment
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
