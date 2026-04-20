import { useState } from "react";
import { ShoppingBag, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import type { CatalogProduct } from "@/types/product";
import ProductDetailDialog from "./ProductDetailDialog";

interface Props {
  product: CatalogProduct;
}

const ProductCard = ({ product }: Props) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const { addItem } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      texture: product.textureStyle,
      length: product.length,
      price: product.price,
      image: product.image,
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="group"
      >
        <button
          type="button"
          onClick={() => setDetailOpen(true)}
          className="relative mb-4 block w-full overflow-hidden rounded-lg bg-secondary/50"
          aria-label={`View ${product.name} details`}
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={800}
            height={800}
            className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 opacity-0 transition-colors group-hover:bg-foreground/20 group-hover:opacity-100">
            <span className="flex items-center gap-2 rounded bg-background/95 px-4 py-2 font-body text-xs uppercase tracking-wider text-foreground">
              <Eye size={14} /> Quick View
            </span>
          </div>
        </button>

        <h3
          onClick={() => setDetailOpen(true)}
          className="mb-1 cursor-pointer font-display text-xl font-semibold text-foreground transition-colors hover:text-accent"
        >
          {product.name}
        </h3>
        <p className="mb-3 font-body text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        <div className="mb-3">
          <p className="mb-2 font-body text-xs uppercase tracking-wider text-muted-foreground">
            Length
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded border border-border px-3 py-1.5 font-body text-xs text-muted-foreground">
              {product.length}
            </span>
            <span className="rounded border border-border px-3 py-1.5 font-body text-xs text-muted-foreground">
              {product.color}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-display text-2xl font-semibold text-foreground">
            GHS {product.price}
          </span>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 rounded bg-accent px-5 py-2.5 font-body text-sm tracking-wide text-accent-foreground transition-opacity hover:opacity-90"
          >
            <ShoppingBag size={16} />
            Add
          </button>
        </div>
      </motion.div>

      <ProductDetailDialog product={product} open={detailOpen} onOpenChange={setDetailOpen} />
    </>
  );
};

export default ProductCard;
