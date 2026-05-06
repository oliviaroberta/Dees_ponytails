import { Link, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import PageBackButton from "@/components/PageBackButton";
import backgroundImage from "@/assets/background.jpg";
import { useAdminProducts } from "@/context/AdminProductsContext";
import { useSales } from "@/context/SalesContext";
import { useCurrency } from "@/context/CurrencyContext";
import { getProductImage } from "@/lib/productImages";
import ProductImageBadges from "@/components/ProductImageBadges";

const Sales = () => {
  const { products } = useAdminProducts();
  const { sales, isLive } = useSales();
  const { formatPrice, currency } = useCurrency();

  const saleProducts = sales.saleItems
    .map((saleItem) => {
      const product = products.find((item) => item.id === saleItem.productId);
      if (!product || saleItem.salePrice <= 0) return null;

      return { product, salePrice: saleItem.salePrice };
    })
    .filter(Boolean) as Array<{ product: (typeof products)[number]; salePrice: number }>;

  if (!isLive || saleProducts.length === 0) {
    return <Navigate to="/" replace />;
  }

  return (
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
        <div className="pt-16">
          <div className="container mx-auto px-4 pt-6 lg:px-8">
            <PageBackButton fallbackTo="/" />
          </div>

          <section className="section-solid py-20">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="mb-12 text-center">
                <p className="mb-3 font-body text-sm uppercase tracking-[0.3em] text-muted-foreground">
                  Limited Time
                </p>
                <h1 className="font-display text-4xl font-light text-foreground md:text-5xl">
                  {sales.title}
                </h1>
                <p className="mx-auto mt-4 max-w-2xl font-body text-sm leading-relaxed text-muted-foreground">
                  {sales.description}
                </p>
                {currency !== "GHS" ? (
                  <p className="mx-auto mt-3 max-w-2xl font-body text-xs text-muted-foreground">
                    Prices on this page are displayed in {currency}. Base store pricing is set in GHS.
                  </p>
                ) : null}
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {saleProducts.map(({ product, salePrice }) => (
                  <Link
                    key={product.id}
                    to={`/shop/${product.id}`}
                    className="group rounded-2xl border border-border/60 bg-card/90 p-4 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20"
                  >
                    <div className="relative mb-4 overflow-hidden rounded-xl bg-secondary/40">
                      <img
                        src={getProductImage(product.name, product.image)}
                        alt={product.name}
                        className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <ProductImageBadges isOnSale={true} isBestseller={product.featured} />
                    </div>

                    <p className="mb-2 font-body text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      {product.textureStyle}
                    </p>
                    <h2 className="font-display text-xl font-semibold text-foreground">
                      {product.name}
                    </h2>
                    <p className="mt-2 font-body text-sm text-muted-foreground">
                      {product.length} | {product.color}
                    </p>

                    <div className="mt-4 flex items-end justify-between gap-3">
                      <div>
                        <p className="font-body text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          Was
                        </p>
                        <p className="font-body text-sm text-muted-foreground line-through">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-body text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          Now
                        </p>
                        <p className="font-display text-2xl font-semibold text-accent">
                          {formatPrice(salePrice)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Sales;
