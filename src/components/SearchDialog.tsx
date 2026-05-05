import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAdminProducts } from "@/context/AdminProductsContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useSales } from "@/context/SalesContext";
import { getProductImage } from "@/lib/productImages";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchDialog = ({ open, onOpenChange }: Props) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { products } = useAdminProducts();
  const { formatPrice } = useCurrency();
  const { getSalePrice } = useSales();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(q) ||
        product.textureStyle.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q),
    );
  }, [products, query]);

  const handleSelect = (productId: string) => {
    onOpenChange(false);
    setQuery("");
    navigate(`/shop?product=${productId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-5 pb-3 pt-5">
          <DialogTitle className="font-display text-lg">Search Ponytails</DialogTitle>
        </DialogHeader>
        <div className="p-5 pt-3">
          <div className="relative mb-4">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, texture, style..."
              className="pl-9 font-body"
            />
          </div>

          <div className="max-h-80 space-y-2 overflow-y-auto">
            {results.length === 0 ? (
              <p className="py-8 text-center font-body text-sm text-muted-foreground">
                No matches. Try another keyword.
              </p>
            ) : (
              results.map((product) => {
                const salePrice = getSalePrice(product.id, product.price);
                const effectivePrice = salePrice ?? product.price;

                return (
                  <button
                    key={product.id}
                    onClick={() => handleSelect(product.id)}
                    className="flex w-full items-center gap-3 rounded p-2 text-left transition-colors hover:bg-secondary/60"
                  >
                    <img
                      src={getProductImage(product.name, product.image)}
                      alt={product.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm font-medium text-foreground">
                        {product.name}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        {product.textureStyle}
                      </p>
                    </div>
                    <div className="text-right">
                      {salePrice ? (
                        <p className="font-body text-[11px] text-muted-foreground line-through">
                          {formatPrice(product.price)}
                        </p>
                      ) : null}
                      <span className={`font-body text-xs ${salePrice ? "text-accent" : "text-muted-foreground"}`}>
                        From {formatPrice(effectivePrice)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
