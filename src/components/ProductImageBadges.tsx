interface ProductImageBadgesProps {
  isOnSale: boolean;
  isBestseller: boolean;
}

const ProductImageBadges = ({ isOnSale, isBestseller }: ProductImageBadgesProps) => (
  <>
    {isOnSale ? (
      <div className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 font-body text-[11px] uppercase tracking-[0.18em] text-accent-foreground">
        Sale
      </div>
    ) : null}
    {isBestseller ? (
      <div className="absolute bottom-3 right-3 rounded-full bg-background/95 px-3 py-1 font-body text-[11px] uppercase tracking-[0.18em] text-foreground">
        Bestseller
      </div>
    ) : null}
  </>
);

export default ProductImageBadges;
