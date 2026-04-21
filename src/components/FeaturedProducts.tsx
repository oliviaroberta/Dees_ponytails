import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdminProducts } from "@/context/AdminProductsContext";
import productStraight from "@/assets/product-straight.jpg";
import productBodywave from "@/assets/product-bodywave.jpg";
import productCurly from "@/assets/product-curly.jpg";
import productKinky from "@/assets/product-kinky.jpg";
import type { CatalogProduct } from "@/types/product";

const getFeaturedImage = (name: string, image?: string) => {
  if (image?.trim()) {
    return image;
  }

  const key = name.toLowerCase();

  if (key.includes("straight")) return productStraight;
  if (key.includes("wave")) return productBodywave;
  if (key.includes("curl")) return productCurly;

  return productKinky;
};

const FeaturedCard = ({ product, index }: { product: CatalogProduct; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Link
        to={`/shop?product=${product.id}`}
        className="block rounded-2xl border border-border/60 bg-card/80 p-3.5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-[0_18px_45px_rgba(27,17,8,0.12)]"
      >
        <div className="relative mb-4 cursor-pointer overflow-hidden rounded-xl bg-secondary/50">
          <img
            src={getFeaturedImage(product.name, product.image)}
            alt={product.name}
            loading="lazy"
            className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/75 via-foreground/30 to-transparent px-4 pb-4 pt-10 text-background">
            <span className="rounded-full border border-background/30 bg-background/10 px-3 py-1 font-body text-[11px] uppercase tracking-[0.22em] backdrop-blur-sm">
              Bestseller
            </span>
          </div>
        </div>
        <h3 className="mb-1 font-display text-lg font-semibold text-foreground transition-colors group-hover:text-accent md:text-xl">
          {product.name}
        </h3>
        <p className="mb-2.5 font-body text-sm text-muted-foreground">
          {product.textureStyle} • {product.length}
        </p>
        <div className="flex items-center justify-between">
          <p className="font-body text-sm text-muted-foreground">From GHS {product.price}</p>
          <span className="inline-flex items-center gap-1 font-body text-xs uppercase tracking-[0.18em] text-foreground">
            Tap to View
            <ArrowRight size={14} />
          </span>
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
            className="inline-block rounded border border-foreground px-10 py-3.5 font-body text-sm uppercase tracking-wider text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            View All Ponytails
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
