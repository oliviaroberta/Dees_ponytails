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
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-background shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-display text-xl font-semibold text-foreground">Your Cart</h2>
              <button onClick={() => setIsOpen(false)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <p className="text-muted-foreground text-center py-12 font-body">Your cart is empty</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-3 border-b border-border/50">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-medium text-foreground text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground font-body">{item.texture} · {item.length}</p>
                      <p className="text-sm font-body font-medium text-foreground mt-1">GH₵{item.price}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-0.5 text-muted-foreground hover:text-foreground">
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-body w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-0.5 text-muted-foreground hover:text-foreground">
                          <Plus size={14} />
                        </button>
                        <button onClick={() => removeItem(item.id)} className="ml-auto p-0.5 text-muted-foreground hover:text-destructive">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-5 border-t border-border space-y-4">
                <div className="flex justify-between font-body">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-lg font-semibold text-foreground">GH₵{total}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground py-3 rounded font-body font-medium tracking-wide hover:opacity-90 transition-opacity"
                >
                  <CreditCard size={18} />
                  Checkout
                </button>
                <p className="text-xs text-center text-muted-foreground font-body">
                  Mobile Money or Card · Secure in-app payment
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
