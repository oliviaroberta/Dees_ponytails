import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CreditCard, ShoppingBag, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import PageBackButton from "@/components/PageBackButton";
import backgroundImage from "@/assets/background.jpg";
import { useAdminProducts } from "@/context/AdminProductsContext";
import { useCart } from "@/context/CartContext";
import { getProductReviews } from "@/data/productReviews";
import { getProductImage } from "@/lib/productImages";
import { parseProductOptions } from "@/lib/productOptions";

const ProductDetails = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { products } = useAdminProducts();
  const { addItem, setIsOpen } = useCart();

  const product = useMemo(() => products.find((item) => item.id === id) ?? null, [id, products]);
  const reviews = useMemo(() => (product ? getProductReviews(product.name) : []), [product]);

  const lengthOptions = useMemo(() => {
    if (!product) return [];
    const parsed = parseProductOptions(product.length);
    return parsed.length > 0 ? parsed : ["Standard"];
  }, [product]);

  const colorOptions = useMemo(() => {
    if (!product) return [];
    const parsed = parseProductOptions(product.color);
    return parsed.length > 0 ? parsed : ["Natural Black"];
  }, [product]);

  const [selectedLength, setSelectedLength] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    setSelectedLength(lengthOptions[0] ?? "");
    setSelectedColor(colorOptions[0] ?? "");
  }, [lengthOptions, colorOptions, id]);

  if (!product) {
    return (
      <PageShell>
        <div className="container mx-auto px-4 pb-20 pt-28 lg:px-8">
          <PageBackButton fallbackTo="/shop" />
          <div className="mt-8 rounded-2xl border border-border/60 bg-card/85 p-10 text-center backdrop-blur">
            <h1 className="font-display text-3xl font-semibold text-foreground">Product not found</h1>
            <p className="mt-3 font-body text-sm text-muted-foreground">
              The product you are looking for does not exist.
            </p>
          </div>
        </div>
      </PageShell>
    );
  }

  const resolvedImage = getProductImage(product.name, product.image);

  const addCurrentItem = () => {
    addItem({
      id: product.id,
      name: product.name,
      texture: product.textureStyle,
      color: selectedColor,
      length: selectedLength,
      price: product.price,
      image: resolvedImage,
    });
  };

  const handleBuyNow = () => {
    addCurrentItem();
    setIsOpen(false);
    navigate("/checkout");
  };

  return (
    <PageShell>
      <div className="container mx-auto px-4 pb-20 pt-28 lg:px-8">
        <PageBackButton fallbackTo="/shop" />

        <section className="mt-8 rounded-[2rem] border border-border/60 bg-card/85 p-5 backdrop-blur md:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div className="overflow-hidden rounded-[1.5rem] bg-secondary/35">
              <img src={resolvedImage} alt={product.name} className="aspect-[4/5] w-full object-cover" />
            </div>

            <div>
              <p className="mb-3 font-body text-xs uppercase tracking-[0.28em] text-muted-foreground">
                {product.textureStyle}
              </p>
              <h1 className="mb-4 font-display text-3xl font-semibold text-foreground md:text-4xl">
                {product.name}
              </h1>

              <div className="mb-5 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1.5 font-body text-xs uppercase tracking-[0.18em] ${
                    product.status === "inStock"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  {product.status === "inStock" ? "In Stock" : "Out of Stock"}
                </span>
                <span className="rounded-full border border-border px-3 py-1.5 font-body text-xs text-muted-foreground">
                  {product.category}
                </span>
              </div>

              <p className="mb-6 font-display text-3xl font-semibold text-foreground">
                GHS {product.price}
              </p>

              <OptionGroup label="Length" options={lengthOptions} selected={selectedLength} onSelect={setSelectedLength} />
              <OptionGroup label="Colour" options={colorOptions} selected={selectedColor} onSelect={setSelectedColor} />

              <div className="mb-8 rounded-2xl border border-border/60 bg-background/60 p-5">
                <p className="mb-2 font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Description
                </p>
                <p className="font-body text-sm leading-relaxed text-foreground/85">
                  {product.description}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={addCurrentItem}
                  className="flex flex-1 items-center justify-center gap-2 rounded border border-foreground px-5 py-3 font-body text-sm tracking-wide text-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  <ShoppingBag size={16} />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex flex-1 items-center justify-center gap-2 rounded bg-accent px-5 py-3 font-body text-sm tracking-wide text-accent-foreground transition-opacity hover:opacity-90"
                >
                  <CreditCard size={16} />
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-[2rem] border border-border/60 bg-card/85 p-6 backdrop-blur md:p-8">
          <div className="mb-8 text-center">
            <p className="mb-3 font-body text-sm uppercase tracking-[0.3em] text-muted-foreground">
              Customer Reviews
            </p>
            <h2 className="font-display text-3xl font-light text-foreground md:text-4xl">
              Reviews For This <span className="font-semibold italic">Style</span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {reviews.map((review) => (
              <div
                key={`${product.id}-${review.name}`}
                className="rounded-2xl border border-border/60 bg-background/60 p-5"
              >
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <Star key={index} size={15} className="fill-accent text-accent" />
                  ))}
                </div>
                <p className="mb-4 font-body text-sm leading-relaxed text-foreground/85">
                  "{review.text}"
                </p>
                <p className="font-display text-sm font-semibold text-muted-foreground">- {review.name}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
};

const PageShell = ({ children }: { children: React.ReactNode }) => (
  <div
    className="relative min-h-screen"
    style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    }}
  >
    <div className="absolute inset-0 bg-background/70" />
    <div className="relative z-10">
      <Navbar />
      <CartDrawer />
      {children}
      <Footer />
    </div>
  </div>
);

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
  <div className="mb-6">
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

export default ProductDetails;
