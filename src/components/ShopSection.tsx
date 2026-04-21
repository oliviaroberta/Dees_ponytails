import { motion } from "framer-motion";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useAdminProducts } from "@/context/AdminProductsContext";
import ProductCard from "./ProductCard";
import ProductDetailDialog from "./ProductDetailDialog";

const ShopSection = () => {
  const { products } = useAdminProducts();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedProduct = useMemo(() => {
    const selectedId = searchParams.get("product");
    if (!selectedId) return null;
    return products.find((product) => product.id === selectedId) ?? null;
  }, [products, searchParams]);

  const handleDialogChange = (open: boolean) => {
    if (open) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("product");
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <>
      <section id="shop" className="section-solid py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <p className="mb-3 font-body text-sm uppercase tracking-[0.3em] text-muted-foreground">
              Collection
            </p>
            <h2 className="font-display text-4xl font-light text-foreground md:text-5xl">
              Our <span className="font-semibold italic">Ponytails</span>
            </h2>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <ProductDetailDialog
        product={selectedProduct}
        open={Boolean(selectedProduct)}
        onOpenChange={handleDialogChange}
      />
    </>
  );
};

export default ShopSection;
