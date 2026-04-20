import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ShoppingBag, CreditCard, Check, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { CatalogProduct } from "@/types/product";
import { useNavigate } from "react-router-dom";

interface Props {
  product: CatalogProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const features = [
  "Premium ponytail quality",
  "Heat-friendly and reusable",
  "Secure drawstring attachment",
  "Easy everyday styling",
];

const ProductDetailDialog = ({ product, open, onOpenChange }: Props) => {
  const { addItem, setIsOpen } = useCart();
  const navigate = useNavigate();

  if (!product) return null;

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      texture: product.textureStyle,
      length: product.length,
      price: product.price,
      image: product.image,
    });
    onOpenChange(false);
  };

  const handleBuyNow = () => {
    addItem({
      id: product.id,
      name: product.name,
      texture: product.textureStyle,
      length: product.length,
      price: product.price,
      image: product.image,
    });
    onOpenChange(false);
    setIsOpen(false);
    navigate("/checkout");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden p-0">
        <div className="grid md:grid-cols-2">
          <div className="aspect-square bg-secondary/40 md:aspect-auto">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          </div>

          <div className="flex flex-col p-6 md:p-8">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="mb-5 inline-flex w-fit items-center gap-2 text-sm uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <p className="mb-2 font-body text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {product.textureStyle}
            </p>
            <h2 className="mb-3 font-display text-2xl font-semibold text-foreground md:text-3xl">
              {product.name}
            </h2>
            <p className="mb-5 font-body text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <ul className="mb-6 space-y-2">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 font-body text-sm text-foreground/80"
                >
                  <Check size={15} className="mt-0.5 shrink-0 text-accent" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mb-5 flex flex-wrap gap-2">
              <span className="rounded border border-border px-3 py-1.5 font-body text-xs text-muted-foreground">
                {product.length}
              </span>
              <span className="rounded border border-border px-3 py-1.5 font-body text-xs text-muted-foreground">
                {product.color}
              </span>
              <span className="rounded border border-border px-3 py-1.5 font-body text-xs text-muted-foreground">
                {product.category}
              </span>
            </div>

            <div className="mb-5 flex items-center justify-between">
              <span className="font-display text-3xl font-semibold text-foreground">
                GHS {product.price}
              </span>
              <span
                className={`rounded-full px-3 py-1 font-body text-xs uppercase tracking-[0.18em] ${
                  product.status === "inStock"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}
              >
                {product.status === "inStock" ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <div className="mt-auto flex flex-col gap-2 sm:flex-row">
              <button
                onClick={handleAdd}
                className="flex flex-1 items-center justify-center gap-2 rounded border border-foreground px-5 py-3 font-body text-sm tracking-wide text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                <ShoppingBag size={16} /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex flex-1 items-center justify-center gap-2 rounded bg-accent px-5 py-3 font-body text-sm tracking-wide text-accent-foreground transition-opacity hover:opacity-90"
              >
                <CreditCard size={16} /> Buy Now
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailDialog;
