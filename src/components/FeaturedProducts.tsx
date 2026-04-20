import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAdminProducts } from "@/context/AdminProductsContext";

const FeaturedProducts = () => {
  const { products } = useAdminProducts();
  const featured = products.filter((product) => product.featured).slice(0, 3);

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

        <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <Link to="/shop" className="block">
                <div className="relative mb-4 overflow-hidden rounded-lg bg-secondary/50">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="mb-1 font-display text-xl font-semibold text-foreground">
                  {product.name}
                </h3>
                <p className="font-body text-sm text-muted-foreground">From GHS {product.price}</p>
              </Link>
            </motion.div>
          ))}
        </div>

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
