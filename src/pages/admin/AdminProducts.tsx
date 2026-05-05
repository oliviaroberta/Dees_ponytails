import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, PlusCircle, Pencil, Trash2 } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdminProducts } from "@/context/AdminProductsContext";

const AdminProducts = () => {
  const { products, deleteProduct } = useAdminProducts();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "inStock" | "outOfStock">("all");

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

  return (
    <AdminShell
      title="Products"
      description="Browse, search, and manage your product list in a simpler layout."
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
        <div className="grid gap-4 lg:grid-cols-[1fr_180px_180px]">
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
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className="rounded-2xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-foreground"
          >
            <option value="all">All Statuses</option>
            <option value="inStock">In Stock</option>
            <option value="outOfStock">Out of Stock</option>
          </select>

          <div className="flex items-center rounded-2xl border border-border/60 bg-background/60 px-4 py-3 font-body text-sm text-muted-foreground">
            {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"}
          </div>
        </div>
      </section>

      {filteredProducts.length === 0 ? (
        <section className="rounded-[1.75rem] border border-dashed border-border/70 bg-card/90 p-10 text-center backdrop-blur">
          <p className="font-body text-sm text-muted-foreground">
            No products match your current search or filter.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {filteredProducts.map((product) => (
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
                    <p className="font-display text-xl font-semibold text-foreground">GHS {product.price}</p>
                  </div>

                  <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-border px-3 py-1 font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {product.category}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 font-body text-[11px] uppercase tracking-[0.18em] ${
                        product.status === "inStock"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      {product.status === "inStock" ? "In Stock" : "Out of Stock"}
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

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      to={`/admin/products/${product.id}/edit`}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 font-body text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-card"
                    >
                      <Pencil size={13} />
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => deleteProduct(product.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-destructive/40 px-4 py-2 font-body text-xs uppercase tracking-[0.18em] text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </AdminShell>
  );
};

export default AdminProducts;
