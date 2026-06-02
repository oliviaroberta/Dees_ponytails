import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdminProducts } from "@/context/AdminProductsContext";
import { useSales } from "@/context/SalesContext";
import { isStorefrontVisibleStatus } from "@/types/product";
import PaginationControls from "@/components/PaginationControls";

const SALES_PRODUCTS_PER_PAGE = 6;

const AdminSales = () => {
  const { products, isLoading: productsLoading } = useAdminProducts();
  const { sales, isLive, updateSales, isLoading } = useSales();
  const [draft, setDraft] = useState(sales);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setDraft(sales);
  }, [sales]);

  const hasChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(sales),
    [draft, sales],
  );
  const saleEligibleProducts = useMemo(
    () => products.filter((product) => isStorefrontVisibleStatus(product.status)),
    [products],
  );

  const selectedCount = draft.saleItems.length;
  const totalPages = Math.max(1, Math.ceil(saleEligibleProducts.length / SALES_PRODUCTS_PER_PAGE));
  const paginatedProducts = useMemo(
    () =>
      saleEligibleProducts.slice(
        (currentPage - 1) * SALES_PRODUCTS_PER_PAGE,
        currentPage * SALES_PRODUCTS_PER_PAGE,
      ),
    [currentPage, saleEligibleProducts],
  );

  const getSaleItem = (productId: string) =>
    draft.saleItems.find((item) => item.productId === productId);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <AdminShell
      title="Sales"
      description="Prepare a hidden sales page and only make it public when you are ready."
      actions={
        <button
          type="button"
          onClick={async () => {
            setError(null);
            setIsSaving(true);
            try {
              await updateSales(draft);
            } catch (saveError) {
              setError(saveError instanceof Error ? saveError.message : "Failed to save sales");
            } finally {
              setIsSaving(false);
            }
          }}
          disabled={!hasChanges || isSaving}
          className="rounded bg-primary px-5 py-2.5 font-body text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Sales"}
        </button>
      }
    >
      {error ? (
        <section className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
          <p className="font-body text-sm text-destructive">{error}</p>
        </section>
      ) : null}
      {isLoading || productsLoading ? (
        <section className="rounded-2xl border border-border/60 bg-card/90 p-8 text-center backdrop-blur">
          <p className="font-body text-sm text-muted-foreground">Loading sales data...</p>
        </section>
      ) : null}
      {!isLoading && !productsLoading ? (
        <>
      <section className="rounded-2xl border border-border/60 bg-card/90 p-6 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">Sales Visibility</h2>
            <p className="mt-2 max-w-2xl font-body text-sm text-muted-foreground">
              The customer sales page stays hidden until you enable it and set a sales price for at least one product.
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/60 px-4 py-3 text-left">
            <p className="font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Status
            </p>
            <p className="mt-1 font-display text-lg font-semibold text-foreground">
              {isLive ? "Live" : "Hidden"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 px-4 py-4">
          <input
            id="sales-enabled"
            type="checkbox"
            checked={draft.enabled}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                enabled: event.target.checked,
              }))
            }
            className="h-4 w-4 accent-current"
          />
          <label htmlFor="sales-enabled" className="font-body text-sm text-foreground">
            Enable public sales page
          </label>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field
            label="Sales Title"
            value={draft.title}
            onChange={(value) => setDraft((current) => ({ ...current, title: value }))}
          />
          <div className="rounded-xl border border-border/60 bg-background/60 px-4 py-4">
            <p className="font-body text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Selected Products
            </p>
            <p className="mt-1 font-display text-lg font-semibold text-foreground">
              {selectedCount}
            </p>
          </div>
          <TextArea
            label="Sales Description"
            value={draft.description}
            onChange={(value) => setDraft((current) => ({ ...current, description: value }))}
            className="md:col-span-2"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/90 p-6 backdrop-blur">
        <h2 className="font-display text-2xl font-semibold text-foreground">Sale Products</h2>
        <p className="mt-2 font-body text-sm text-muted-foreground">
          Choose products for the sales page and set the discounted sales price for each one.
        </p>

        <div className="mt-6 space-y-3">
          {paginatedProducts.map((product) => {
            const saleItem = getSaleItem(product.id);
            const selected = !!saleItem;

            return (
              <div
                key={product.id}
                className={`rounded-xl border px-4 py-4 transition-colors ${
                  selected
                    ? "border-foreground/30 bg-background"
                    : "border-border/60 bg-background/60"
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <label className="flex cursor-pointer items-center gap-4 lg:flex-1">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          saleItems: event.target.checked
                            ? [...current.saleItems, { productId: product.id, salePrice: product.price }]
                            : current.saleItems.filter((item) => item.productId !== product.id),
                        }))
                      }
                      className="h-4 w-4 accent-current"
                    />
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg font-semibold text-foreground">{product.name}</p>
                      <p className="mt-1 font-body text-sm text-muted-foreground">
                        {product.textureStyle} | {product.length} | Original GHS {product.price}
                      </p>
                    </div>
                  </label>

                  <div className="lg:w-52">
                    <label className="mb-1.5 block font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      Sales Price
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      disabled={!selected}
                      value={saleItem?.salePrice ?? ""}
                      onChange={(event) => {
                        const nextValue = Number(event.target.value);
                        setDraft((current) => ({
                          ...current,
                          saleItems: current.saleItems.map((item) =>
                            item.productId === product.id
                              ? {
                                  ...item,
                                  salePrice: Number.isFinite(nextValue) ? nextValue : 0,
                                }
                              : item,
                          ),
                        }));
                      }}
                      className="w-full rounded border border-border bg-background px-3 py-2.5 font-body text-sm text-foreground transition-colors focus:border-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={SALES_PRODUCTS_PER_PAGE}
          totalItems={saleEligibleProducts.length}
          itemLabel="product"
          onPageChange={setCurrentPage}
        />
      </section>
        </>
      ) : null}
    </AdminShell>
  );
};

const Field = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div>
    <label className="mb-1.5 block font-body text-xs uppercase tracking-[0.18em] text-muted-foreground">
      {label}
    </label>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded border border-border bg-background px-3 py-2.5 font-body text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
    />
  </div>
);

const TextArea = ({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) => (
  <div className={className}>
    <label className="mb-1.5 block font-body text-xs uppercase tracking-[0.18em] text-muted-foreground">
      {label}
    </label>
    <textarea
      rows={4}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded border border-border bg-background px-3 py-2.5 font-body text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
    />
  </div>
);

export default AdminSales;
