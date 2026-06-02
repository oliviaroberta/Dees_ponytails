import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, PlusCircle, Search, Trash2 } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdminProducts } from "@/context/AdminProductsContext";
import {
  getProductStatusLabel,
  type ProductStatus,
} from "@/types/product";
import PaginationControls from "@/components/PaginationControls";

const PRODUCTS_PER_PAGE = 6;
type ProductFilter = "all" | ProductStatus;

type PendingAction =
  | {
      productId: string;
      productName: string;
      kind: "status";
      nextStatus: ProductStatus;
      title: string;
      description: string;
      confirmLabel: string;
    }
  | {
      productId: string;
      productName: string;
      kind: "delete";
      title: string;
      description: string;
      confirmLabel: string;
    };

const getStatusBadgeClass = (status: ProductStatus) => {
  switch (status) {
    case "inStock":
      return "bg-primary text-primary-foreground";
    case "outOfStock":
      return "bg-secondary text-foreground";
    case "archived":
      return "border border-border bg-background text-muted-foreground";
    case "draft":
      return "border border-dashed border-border bg-background text-muted-foreground";
  }
};

const buildStatusActionCopy = (status: ProductStatus, productName: string) => {
  switch (status) {
    case "outOfStock":
      return {
        title: "Mark Product Out of Stock",
        description: `${productName} will stay visible in the storefront, but customers will see it as unavailable.`,
        confirmLabel: "Mark Out of Stock",
      };
    case "archived":
      return {
        title: "Archive Product",
        description: `${productName} will be kept for history and admin records, but hidden from the storefront.`,
        confirmLabel: "Archive Product",
      };
    case "draft":
      return {
        title: "Hide Product From Store",
        description: `${productName} will be saved as a draft and hidden from the storefront until you publish it again.`,
        confirmLabel: "Hide From Store",
      };
    case "inStock":
      return {
        title: "Publish Product To Store",
        description: `${productName} will become available in the storefront as an active in-stock product.`,
        confirmLabel: "Set In Stock",
      };
  }
};

const AdminProducts = () => {
  const { products, deleteProduct, setProductStatus, isLoading, error } = useAdminProducts();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductFilter>("all");
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [actionProductId, setActionProductId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.textureStyle.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery);

      const matchesStatus = statusFilter === "all" || product.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [products, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const paginatedProducts = useMemo(
    () =>
      filteredProducts.slice(
        (currentPage - 1) * PRODUCTS_PER_PAGE,
        currentPage * PRODUCTS_PER_PAGE,
      ),
    [currentPage, filteredProducts],
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, statusFilter]);

  const confirmAction = async () => {
    if (!pendingAction) {
      return;
    }

    setActionError(null);
    setActionProductId(pendingAction.productId);

    try {
      if (pendingAction.kind === "delete") {
        await deleteProduct(pendingAction.productId);
      } else {
        await setProductStatus(pendingAction.productId, pendingAction.nextStatus);
      }
      setPendingAction(null);
    } catch (actionErrorValue) {
      setActionError(
        actionErrorValue instanceof Error
          ? actionErrorValue.message
          : "Failed to update product",
      );
    } finally {
      setActionProductId(null);
    }
  };

  return (
    <AdminShell
      title="Products"
      description="Manage product visibility, stock state, and safe lifecycle actions without breaking order history."
      actions={
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 rounded bg-primary px-5 py-3 font-body text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
        >
          <PlusCircle size={14} />
          Add Product
        </Link>
      }
    >
      <section className="rounded-[1.75rem] border border-border/60 bg-card/90 p-5 backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-[1fr_200px_180px]">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by product name, texture, or category"
              className="w-full rounded-2xl border border-border bg-background px-11 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-foreground"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as ProductFilter)}
            className="rounded-2xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-foreground"
          >
            <option value="all">All Products</option>
            <option value="inStock">In Stock</option>
            <option value="outOfStock">Out of Stock</option>
            <option value="archived">Archived</option>
            <option value="draft">Draft</option>
          </select>

          <div className="flex items-center rounded-2xl border border-border/60 bg-background/60 px-4 py-3 font-body text-sm text-muted-foreground">
            {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"}
          </div>
        </div>
      </section>

      {actionError ? (
        <section className="rounded-[1.75rem] border border-destructive/30 bg-destructive/10 p-6 text-center">
          <p className="font-body text-sm text-destructive">{actionError}</p>
        </section>
      ) : null}

      {isLoading ? (
        <section className="rounded-[1.75rem] border border-dashed border-border/70 bg-card/90 p-10 text-center backdrop-blur">
          <p className="font-body text-sm text-muted-foreground">Loading products...</p>
        </section>
      ) : error ? (
        <section className="rounded-[1.75rem] border border-destructive/30 bg-destructive/10 p-10 text-center">
          <p className="font-body text-sm text-destructive">{error}</p>
        </section>
      ) : filteredProducts.length === 0 ? (
        <section className="rounded-[1.75rem] border border-dashed border-border/70 bg-card/90 p-10 text-center backdrop-blur">
          <p className="font-body text-sm text-muted-foreground">
            No products match your current search or filter.
          </p>
        </section>
      ) : (
        <>
          <section className="grid gap-4 xl:grid-cols-2">
            {paginatedProducts.map((product) => {
              const isBusy = actionProductId === product.id;

              return (
                <article
                  key={product.id}
                  className="rounded-[1.75rem] border border-border/60 bg-card/90 p-5 backdrop-blur"
                >
                  <div className="flex flex-col gap-5 sm:flex-row">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-32 w-full rounded-[1.5rem] object-cover sm:w-32"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-display text-xl font-semibold text-foreground">{product.name}</p>
                          <p className="mt-1 font-body text-sm text-muted-foreground">
                            {product.textureStyle} | {product.length} | {product.color}
                          </p>
                        </div>
                        <p className="font-display text-xl font-semibold text-foreground">Base GHS {product.price}</p>
                      </div>

                      <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground">
                        {product.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-border px-3 py-1 font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          {product.category}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 font-body text-[11px] uppercase tracking-[0.18em] ${getStatusBadgeClass(
                            product.status,
                          )}`}
                        >
                          {getProductStatusLabel(product.status)}
                        </span>
                        <span className="rounded-full border border-border px-3 py-1 font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          Stock {product.stock}
                        </span>
                        {product.featured ? (
                          <span className="rounded-full bg-accent px-3 py-1 font-body text-[11px] uppercase tracking-[0.18em] text-accent-foreground">
                            Featured
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
                        <div>
                          <label className="mb-1.5 block font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            Product Status
                          </label>
                          <select
                            value={product.status}
                            disabled={isBusy}
                            onChange={(event) => {
                              const nextStatus = event.target.value as ProductStatus;
                              if (nextStatus === product.status) {
                                return;
                              }

                              const actionCopy = buildStatusActionCopy(nextStatus, product.name);
                              setPendingAction({
                                productId: product.id,
                                productName: product.name,
                                kind: "status",
                                nextStatus,
                                ...actionCopy,
                              });
                            }}
                            className="w-full rounded-full border border-border bg-background px-4 py-2.5 font-body text-xs uppercase tracking-[0.18em] text-foreground outline-none transition-colors focus:border-foreground"
                          >
                            <option value="inStock">In Stock</option>
                            <option value="outOfStock">Out of Stock</option>
                            <option value="archived">Archived</option>
                            <option value="draft">Draft</option>
                          </select>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Link
                            to={`/admin/products/${product.id}/edit`}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                          >
                            <Pencil size={12} />
                            Edit
                          </Link>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              setPendingAction({
                                productId: product.id,
                                productName: product.name,
                                kind: "delete",
                                title: "Delete Product Permanently",
                                description: `${product.name} will be permanently removed if it has never been used in customer orders. This action cannot be undone.`,
                                confirmLabel: "Delete Product",
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 px-3 py-1 font-body text-[11px] uppercase tracking-[0.18em] text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={12} />
                            {isBusy ? "Working..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={PRODUCTS_PER_PAGE}
            totalItems={filteredProducts.length}
            itemLabel="product"
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {pendingAction ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.75rem] border border-border/60 bg-card p-6 shadow-2xl">
            <h2 className="font-display text-2xl font-semibold text-foreground">{pendingAction.title}</h2>
            <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground">
              {pendingAction.description}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="rounded-full border border-border px-5 py-2.5 font-body text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-background"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmAction()}
                disabled={actionProductId === pendingAction.productId}
                className="rounded-full bg-primary px-5 py-2.5 font-body text-xs uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {actionProductId === pendingAction.productId ? "Working..." : pendingAction.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
};

export default AdminProducts;
