import { Link } from "react-router-dom";
import AdminShell from "@/components/admin/AdminShell";
import { useAdminProducts } from "@/context/AdminProductsContext";

const AdminDashboard = () => {
  const { products } = useAdminProducts();

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const lowStock = products.filter((product) => product.stock <= 5).length;

  return (
    <AdminShell
      title="Dashboard"
      description="Manage your store products from one simple admin space."
    >
      <div className="grid gap-6 md:grid-cols-3">
        <SummaryCard label="Products" value={String(totalProducts)} />
        <SummaryCard label="Total Stock" value={String(totalStock)} />
        <SummaryCard label="Low Stock" value={String(lowStock)} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-border/60 bg-card/90 p-6 backdrop-blur">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground">
                Recent Products
              </h2>
              <p className="font-body text-sm text-muted-foreground">
                Quick view of the products currently in your admin list.
              </p>
            </div>
            <Link
              to="/admin/products"
              className="font-body text-xs uppercase tracking-[0.18em] text-accent"
            >
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {products.slice(0, 4).map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 px-4 py-4"
              >
                <div>
                  <p className="font-display text-lg font-semibold text-foreground">
                    {product.name}
                  </p>
                  <p className="font-body text-sm text-muted-foreground">
                    GHS {product.price} · Stock {product.stock}
                  </p>
                </div>
                <Link
                  to={`/admin/products/${product.id}/edit`}
                  className="font-body text-xs uppercase tracking-[0.18em] text-accent"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/90 p-6 backdrop-blur">
          <h2 className="font-display text-2xl font-semibold text-foreground">Quick Actions</h2>
          <div className="mt-5 space-y-3">
            <ActionLink to="/admin/products" label="Manage Products" />
            <ActionLink to="/admin/products/new" label="Add New Product" />
          </div>
        </section>
      </div>
    </AdminShell>
  );
};

const SummaryCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-border/60 bg-card/90 p-6 backdrop-blur">
    <p className="font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
    <p className="mt-3 font-display text-4xl font-semibold text-foreground">{value}</p>
  </div>
);

const ActionLink = ({ to, label }: { to: string; label: string }) => (
  <Link
    to={to}
    className="block rounded-xl border border-border/60 bg-background/60 px-4 py-4 font-body text-sm uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-background"
  >
    {label}
  </Link>
);

export default AdminDashboard;
