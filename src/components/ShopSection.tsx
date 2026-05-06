import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { useAdminProducts } from "@/context/AdminProductsContext";
import { normalizeCategoryKey } from "@/lib/strings";
import ProductCard from "./ProductCard";

const ShopSection = () => {
  const { products } = useAdminProducts();
  const [searchParams] = useSearchParams();
  const [activeCollection, setActiveCollection] = useState("all");
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);
  const targetProductId = searchParams.get("product");

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        products
          .map((product) => product.category.trim())
          .filter(Boolean),
      ),
    ).sort((left, right) => left.localeCompare(right));

    return [
      {
        key: "all",
        label: "All Ponytails",
        description: "Browse the full Dees_ponytails collection.",
      },
      ...uniqueCategories.map((category) => ({
        key: normalizeCategoryKey(category),
        label: category,
        description: `${category} styles available in the shop.`,
      })),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCollection === "all") {
      return products;
    }

    return products.filter(
      (product) => normalizeCategoryKey(product.category) === activeCollection,
    );
  }, [activeCollection, products]);

  const activeMeta =
    categories.find((collection) => collection.key === activeCollection) ?? categories[0];

  useEffect(() => {
    if (!targetProductId) return;

    const targetProduct = products.find((product) => product.id === targetProductId);
    if (!targetProduct) return;

    const targetCollection = normalizeCategoryKey(targetProduct.category) || "all";
    if (targetCollection !== activeCollection) {
      setActiveCollection(targetCollection);
      return;
    }

    const timer = window.setTimeout(() => {
      const element = document.getElementById(`product-card-${targetProductId}`);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedProductId(targetProductId);
    }, 120);

    return () => window.clearTimeout(timer);
  }, [activeCollection, products, targetProductId]);

  useEffect(() => {
    if (!highlightedProductId) return;

    const clearHighlight = window.setTimeout(() => {
      setHighlightedProductId(null);
    }, 3500);

    return () => window.clearTimeout(clearHighlight);
  }, [highlightedProductId]);

  return (
    <section id="shop" className="section-solid py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <p className="mb-3 font-body text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Collection
          </p>
          <h2 className="font-display text-4xl font-light text-foreground md:text-5xl">
            Our <span className="font-semibold italic">Ponytails</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-body text-sm leading-relaxed text-muted-foreground">
            Shop by category to find the type you are looking for faster.
          </p>
        </motion.div>

        <div className="mx-auto mb-10 max-w-5xl rounded-[1.75rem] border border-border/60 bg-card/80 p-4 backdrop-blur md:p-5">
          <div className="flex flex-wrap gap-3">
            {categories.map((collection) => {
              const count =
                collection.key === "all"
                  ? products.length
                  : products.filter(
                      (product) => normalizeCategoryKey(product.category) === collection.key,
                    ).length;

              return (
                <button
                  key={collection.key}
                  type="button"
                  onClick={() => setActiveCollection(collection.key)}
                  className={`rounded-full px-4 py-2.5 font-body text-sm transition-colors ${
                    activeCollection === collection.key
                      ? "bg-foreground text-background"
                      : "border border-border bg-background/70 text-foreground hover:border-foreground"
                  }`}
                >
                  {collection.label} <span className="ml-1 text-xs opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 px-1">
            <p className="font-display text-xl text-foreground">{activeMeta.label}</p>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              {activeMeta.description}
            </p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-[1.75rem] border border-border/60 bg-card/80 p-10 text-center backdrop-blur">
            <p className="font-body text-sm text-muted-foreground">
              No products in this collection yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                highlighted={product.id === highlightedProductId}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ShopSection;
