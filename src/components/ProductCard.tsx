import { Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useCurrency } from "@/context/CurrencyContext";
import { useSales } from "@/context/SalesContext";
import type { CatalogProduct } from "@/types/product";
import { getProductImage } from "@/lib/productImages";
import { Link } from "react-router-dom";

interface Props {
  product: CatalogProduct;
  highlighted?: boolean;
}

const ProductCard = ({ product, highlighted = false }: Props) => {
  const { formatPrice, currency } = useCurrency();
  const { getSalePrice } = useSales();
  const salePrice = getSalePrice(product.id, product.price);
  const effectivePrice = salePrice ?? product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      id={`product-card-${product.id}`}
      className={`group rounded-[1.75rem] border border-border/60 bg-card/90 p-4 backdrop-blur transition-all duration-500 ${
        highlighted ? "ring-2 ring-foreground/60 ring-offset-4 ring-offset-background" : ""
      }`}
    >
      <Link
        to={`/shop/${product.id}`}
        className="relative mb-4 block overflow-hidden rounded-[1.4rem] bg-secondary/50"
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
      </Link>

      <div className="rounded-[1.25rem] bg-background/60 p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="mb-1 font-body text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              {product.textureStyle}
            </p>
            <Link
              to={`/shop/${product.id}`}
              className="block font-display text-xl font-semibold leading-snug text-foreground transition-colors hover:text-accent"
            >
              {product.name}
            </Link>
          </div>
          {salePrice ? (
            <span className="shrink-0 rounded-full bg-accent px-3 py-1 font-body text-[11px] uppercase tracking-[0.18em] text-accent-foreground">
              Sale
            </span>
          ) : null}
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            {salePrice ? (
              <p className="font-body text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Original Price
              </p>
            ) : null}
            {salePrice ? (
              <p className="font-body text-xs text-muted-foreground line-through">
                {formatPrice(product.price)}
              </p>
            ) : null}
            <p className="mt-1 font-body text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {salePrice ? "Sale Price" : "Price"}
            </p>
            <span className={`font-display text-2xl font-semibold ${salePrice ? "text-accent" : "text-foreground"}`}>
              {formatPrice(effectivePrice)}
            </span>
            {currency !== "GHS" ? (
              <p className="mt-1 font-body text-[11px] text-muted-foreground">
                Displayed in {currency}
              </p>
            ) : null}
          </div>
          <Link
            to={`/shop/${product.id}`}
            className="inline-flex items-center gap-1 font-body text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            View Details
            <Eye size={13} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
