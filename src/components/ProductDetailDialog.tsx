import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ShoppingBag, CreditCard } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { CatalogProduct } from "@/types/product";
import { useNavigate } from "react-router-dom";

interface Props {
  product: CatalogProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const parseOptions = (value?: string) =>
  (value ?? "")
    .split(/[,/|]/)
    .map((item) => item.trim())
    .filter(Boolean);

const ProductDetailDialog = ({ product, open, onOpenChange }: Props) => {
  const { addItem, setIsOpen } = useCart();
  const navigate = useNavigate();

  const lengthOptions = useMemo(() => {
    if (!product) return [];
    const parsed = parseOptions(product.length);
    return parsed.length > 0 ? parsed : ["Standard"];
  }, [product]);

  const colorOptions = useMemo(() => {
    if (!product) return [];
    const parsed = parseOptions(product.color);
    return parsed.length > 0 ? parsed : ["Natural Black"];
  }, [product]);

  const [selectedLength, setSelectedLength] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    setSelectedLength(lengthOptions[0] ?? "");
    setSelectedColor(colorOptions[0] ?? "");
  }, [lengthOptions, colorOptions, product?.id]);

  if (!product) return null;

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      texture: product.textureStyle,
      color: selectedColor,
      length: selectedLength,
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
      color: selectedColor,
      length: selectedLength,
      price: product.price,
      image: product.image,
    });
    onOpenChange(false);
    setIsOpen(false);
    navigate("/checkout");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] max-w-4xl overflow-hidden p-0">
        <div className="grid max-h-[92svh] md:grid-cols-[0.88fr_1.12fr]">
          <div className="aspect-[4/4.6] bg-secondary/40 md:h-full md:aspect-auto">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          </div>

          <div className="flex max-h-[92svh] flex-col overflow-y-auto p-6 md:p-8 lg:p-10">
            <h2 className="mb-6 font-display text-2xl font-semibold text-foreground md:text-3xl">
              {product.name}
            </h2>

            <div className="mb-5 flex flex-wrap gap-2">
              <span className="rounded border border-border px-3 py-1.5 font-body text-xs text-muted-foreground">
                {product.textureStyle}
              </span>
              <span
                className={`rounded-full px-3 py-1.5 font-body text-xs uppercase tracking-[0.18em] ${
                  product.status === "inStock"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}
              >
                {product.status === "inStock" ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <div className="mb-6 space-y-5">
              <OptionGroup
                label="Length"
                options={lengthOptions}
                selected={selectedLength}
                onSelect={setSelectedLength}
              />
              <OptionGroup
                label="Colour"
                options={colorOptions}
                selected={selectedColor}
                onSelect={setSelectedColor}
              />
            </div>

            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="mb-1 font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Price
                </p>
                <p className="font-display text-3xl font-semibold text-foreground">
                  GHS {product.price}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="mb-2 font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Description
              </p>
              <p className="font-body text-sm leading-relaxed text-foreground/85">
                {product.description}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2 pt-2 sm:flex-row">
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

const OptionGroup = ({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) => (
  <div>
    <p className="mb-2 font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
      {label}
    </p>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(option)}
          className={`rounded border px-3 py-1.5 font-body text-xs transition-colors ${
            selected === option
              ? "border-foreground bg-foreground text-background"
              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);

export default ProductDetailDialog;
