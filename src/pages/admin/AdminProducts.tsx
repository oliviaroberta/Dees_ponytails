import { Link } from "react-router-dom";
import AdminShell from "@/components/admin/AdminShell";
import { useAdminProducts } from "@/context/AdminProductsContext";

const AdminProducts = () => {
  const { products, deleteProduct } = useAdminProducts();

  return (
    <AdminShell
      title="Products"
      description="View, edit, and remove products from your store list."
      actions={
        <Link
          to="/admin/products/new"
          className="rounded bg-primary px-5 py-3 font-body text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
        >
          Add Product
        </Link>
      }
    >
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/90 backdrop-blur">
        <div className="hidden grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_1fr] gap-4 border-b border-border/60 px-6 py-4 font-body text-xs uppercase tracking-[0.18em] text-muted-foreground xl:grid">
          <span>Product</span>
          <span>Category</span>
          <span>Price</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        <div className="divide-y divide-border/60">
          {products.map((product) => (
            <div
              key={product.id}
              className="grid gap-4 px-6 py-5 xl:grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_1fr] xl:items-center"
            >
              <div className="flex gap-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-20 w-20 rounded-xl object-cover"
                />
                <div>
                  <p className="font-display text-xl font-semibold text-foreground">{product.name}</p>
                  <p className="mt-1 font-body text-sm text-muted-foreground">
                    {product.textureStyle} · {product.length} · {product.color}
                  </p>
                  <p className="mt-2 font-body text-sm text-muted-foreground">
                    {product.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.featured ? (
                      <span className="rounded-full bg-accent px-3 py-1 font-body text-[11px] uppercase tracking-[0.18em] text-accent-foreground">
                        Featured
                      </span>
                    ) : null}
                    <span className="rounded-full border border-border px-3 py-1 font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      Stock {product.stock}
                    </span>
                  </div>
                </div>
              </div>

              <p className="font-body text-sm text-foreground">{product.category}</p>
              <p className="font-body text-sm text-foreground">GHS {product.price}</p>
              <p>
                <span
                  className={`rounded-full px-3 py-1 font-body text-[11px] uppercase tracking-[0.18em] ${
                    product.status === "inStock"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  {product.status === "inStock" ? "In Stock" : "Out of Stock"}
                </span>
              </p>

              <div className="flex gap-3">
                <Link
                  to={`/admin/products/${product.id}/edit`}
                  className="rounded border border-border px-3 py-2 font-body text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-background"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => deleteProduct(product.id)}
                  className="rounded border border-destructive/40 px-3 py-2 font-body text-xs uppercase tracking-[0.18em] text-destructive transition-colors hover:bg-destructive/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
};

export default AdminProducts;
