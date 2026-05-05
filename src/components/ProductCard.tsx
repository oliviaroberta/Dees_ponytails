import type React from "react";
import { ShoppingBag, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useSales } from "@/context/SalesContext";
import type { CatalogProduct } from "@/types/product";
import { getProductImage } from "@/lib/productImages";
import { getPrimaryProductOption } from "@/lib/productOptions";
import { Link } from "react-router-dom";

interface Props {
  product: CatalogProduct;
  highlighted?: boolean;
}

const ProductCard = ({ product, highlighted = false }: Props) => {
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const { getSalePrice } = useSales();
  const salePrice = getSalePrice(product.id, product.price);
  const effectivePrice = salePrice ?? product.price;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      texture: product.textureStyle,
      color: getPrimaryProductOption(product.color, "Natural Black"),
      length: getPrimaryProductOption(product.length, "Standard"),
      price: effectivePrice,
      image: getProductImage(product.name, product.image),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      id={`product-card-${product.id}`}
      className={`group rounded-2xl transition-all duration-500 ${
        highlighted ? "ring-2 ring-foreground/60 ring-offset-4 ring-offset-background" : ""
      }`}
    >
      <Link
        to={`/shop/${product.id}`}
        className="relative mb-4 block overflow-hidden rounded-lg bg-secondary/50"
        aria-label={`View ${product.name} details`}
      >
        <img
          src={getProductImage(product.name, product.image)}
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
        {salePrice ? (
          <div className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 font-body text-[11px] uppercase tracking-[0.18em] text-accent-foreground">
            Sale
          </div>
        ) : null}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-end gap-2 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent p-3">
          <span className="rounded-full bg-background/90 px-3 py-1 font-body text-[11px] uppercase tracking-[0.2em] text-foreground">
            {product.textureStyle}
          </span>
        </div>
      </Link>

      <p className="mb-2 font-body text-xs uppercase tracking-[0.25em] text-muted-foreground">
        {product.textureStyle}
      </p>
      <Link
        to={`/shop/${product.id}`}
        className="mb-1 block font-display text-xl font-semibold text-foreground transition-colors hover:text-accent"
      >
        {product.name}
      </Link>
      <p className="mb-3 font-body text-sm leading-relaxed text-muted-foreground">
        {product.description}
      </p>

      <div className="mb-3 flex flex-wrap gap-2">
        <span className="rounded border border-border px-3 py-1.5 font-body text-xs text-muted-foreground">
          Length: {product.length}
        </span>
        <span className="rounded border border-border px-3 py-1.5 font-body text-xs text-muted-foreground">
          Color: {product.color}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          {salePrice ? (
            <p className="font-body text-xs text-muted-foreground line-through">
              {formatPrice(product.price)}
            </p>
          ) : null}
          <span className={`font-display text-2xl font-semibold ${salePrice ? "text-accent" : "text-foreground"}`}>
            {formatPrice(effectivePrice)}
          </span>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded bg-accent px-5 py-2.5 font-body text-sm tracking-wide text-accent-foreground transition-opacity hover:opacity-90"
        >
          <ShoppingBag size={16} />
          Add
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
