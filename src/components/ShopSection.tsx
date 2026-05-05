import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAdminProducts } from "@/context/AdminProductsContext";
import ProductCard from "./ProductCard";
import type { CatalogProduct } from "@/types/product";
import { useSearchParams } from "react-router-dom";

type CollectionKey = "all" | "straight" | "waves" | "curls" | "natural";

const COLLECTIONS: {
  key: CollectionKey;
  label: string;
  description: string;
}[] = [
  {
    key: "all",
    label: "All Ponytails",
    description: "Browse the full Dees_ponytails collection.",
  },
  {
    key: "straight",
    label: "Straight",
    description: "Smooth, sleek ponytails with a polished finish.",
  },
  {
    key: "waves",
    label: "Waves",
    description: "Soft body wave styles with natural movement.",
  },
  {
    key: "curls",
    label: "Curls",
    description: "Defined curl styles for a fuller glam look.",
  },
  {
    key: "natural",
    label: "Natural Texture",
    description: "Textured styles that blend beautifully with natural hair.",
  },
];

const getCollectionKey = (product: CatalogProduct): CollectionKey => {
  const texture = (product.textureStyle ?? "").toLowerCase();
  const name = (product.name ?? "").toLowerCase();

  if (texture.includes("straight") && !texture.includes("kinky")) return "straight";
  if (texture.includes("wave")) return "waves";
  if (texture.includes("curl")) return "curls";
  if (texture.includes("kinky") || name.includes("natural")) return "natural";

  return "all";
};

const ShopSection = () => {
  const { products } = useAdminProducts();
  const [searchParams] = useSearchParams();
  const [activeCollection, setActiveCollection] = useState<CollectionKey>("all");
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);
  const targetProductId = searchParams.get("product");

  const filteredProducts = useMemo(() => {
    if (activeCollection === "all") {
      return products;
    }

    return products.filter((product) => getCollectionKey(product) === activeCollection);
  }, [activeCollection, products]);

  const activeMeta =
    COLLECTIONS.find((collection) => collection.key === activeCollection) ?? COLLECTIONS[0];

  useEffect(() => {
    if (!targetProductId) return;

    const targetProduct = products.find((product) => product.id === targetProductId);
    if (!targetProduct) return;

    const targetCollection = getCollectionKey(targetProduct);
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
            Shop by collection to find the texture and finish that suits your look faster.
          </p>
        </motion.div>

        <div className="mx-auto mb-10 max-w-5xl rounded-[1.75rem] border border-border/60 bg-card/80 p-4 backdrop-blur md:p-5">
          <div className="flex flex-wrap gap-3">
            {COLLECTIONS.map((collection) => {
              const count =
                collection.key === "all"
                  ? products.length
                  : products.filter((product) => getCollectionKey(product) === collection.key).length;

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
            <p className="mt-1 font-body text-sm text-muted-foreground">{activeMeta.description}</p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-[1.75rem] border border-border/60 bg-card/80 p-10 text-center backdrop-blur">
            <p className="font-body text-sm text-muted-foreground">
              No products in this collection yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
