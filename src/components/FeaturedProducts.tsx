import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdminProducts } from "@/context/AdminProductsContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useSales } from "@/context/SalesContext";
import type { CatalogProduct } from "@/types/product";
import { getProductImage } from "@/lib/productImages";
import ProductImageBadges from "./ProductImageBadges";

const FeaturedCard = ({ product, index }: { product: CatalogProduct; index: number }) => {
  const { formatPrice, currency } = useCurrency();
  const { getSalePrice } = useSales();
  const salePrice = getSalePrice(product.id, product.price);
  const effectivePrice = salePrice ?? product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Link
        to={`/shop/${product.id}`}
        className="block rounded-[1.75rem] border border-border/60 bg-card/90 p-4 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-[0_18px_45px_rgba(27,17,8,0.12)]"
      >
        <div className="relative mb-4 cursor-pointer overflow-hidden rounded-[1.4rem] bg-secondary/50">
          <img
            src={getProductImage(product.name, product.image)}
            alt={product.name}
            loading="lazy"
            className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <ProductImageBadges isOnSale={!!salePrice} isBestseller={product.featured} />
        </div>
        <div className="rounded-[1.25rem] bg-background/60 p-4">
          <p className="mb-1 font-body text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            {product.textureStyle}
          </p>
          <h3 className="font-display text-xl font-semibold text-foreground transition-colors group-hover:text-accent">
            {product.name}
          </h3>
          <div className="mt-3 flex items-end justify-between gap-4">
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
              <p className={`font-display text-2xl font-semibold ${salePrice ? "text-accent" : "text-foreground"}`}>
                {formatPrice(effectivePrice)}
              </p>
              {currency !== "GHS" ? (
                <p className="mt-1 font-body text-[11px] text-muted-foreground">
                  Displayed in {currency}
                </p>
              ) : null}
            </div>
            <span className="inline-flex items-center gap-1 font-body text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors group-hover:text-foreground">
              View Details
              <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const FeaturedProducts = () => {
  const { products } = useAdminProducts();
  const featuredPool = products.filter((product) => product.featured);
  const featured = (featuredPool.length > 0 ? featuredPool : products).slice(0, 3);

  return (
    <section className="section-transparent py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <p className="mb-3 font-body text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Bestsellers
          </p>
          <h2 className="font-display text-4xl font-light text-foreground md:text-5xl">
            Our <span className="font-semibold italic">Favourites</span>
          </h2>
        </motion.div>

        {featured.length === 0 ? (
          <div className="mb-12 rounded-2xl border border-border/60 bg-card/80 p-8 text-center backdrop-blur">
            <p className="font-body text-sm text-muted-foreground">
              No bestseller products yet. Add products in the admin dashboard to show them here.
            </p>
          </div>
        ) : (
          <div className="mx-auto mb-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product, index) => (
              <FeaturedCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}

        <div className="text-center">
          <Link
            to="/shop"
            className="cta-lift inline-block rounded border border-foreground px-10 py-3.5 font-body text-sm uppercase tracking-wider text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            View All Ponytails
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
