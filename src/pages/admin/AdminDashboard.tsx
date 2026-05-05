import { Link } from "react-router-dom";
import { Package, AlertTriangle, Layers3, PlusCircle, BadgePercent, Settings } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { useAdminProducts } from "@/context/AdminProductsContext";

const AdminDashboard = () => {
  const { products } = useAdminProducts();

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const lowStock = products.filter((product) => product.stock <= 5).length;
  const featuredCount = products.filter((product) => product.featured).length;

  return (
    <AdminShell
      title="Dashboard"
      description="A cleaner overview of your catalog, stock position, and quick admin shortcuts."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Products" value={String(totalProducts)} hint="Products in your store" icon={Package} />
        <SummaryCard label="Total Stock" value={String(totalStock)} hint="Total units available" icon={Layers3} />
        <SummaryCard label="Low Stock" value={String(lowStock)} hint="Products at 5 or less" icon={AlertTriangle} />
        <SummaryCard label="Featured" value={String(featuredCount)} hint="Shown as bestsellers" icon={BadgePercent} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-[1.75rem] border border-border/60 bg-card/90 p-6 backdrop-blur">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground">Recent Products</h2>
              <p className="mt-1 font-body text-sm text-muted-foreground">
                Quick access to your latest catalog entries.
              </p>
            </div>
            <Link
              to="/admin/products"
              className="font-body text-xs uppercase tracking-[0.18em] text-accent"
            >
              View all
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 p-8 text-center">
              <p className="font-body text-sm text-muted-foreground">
                No products yet. Start by adding your first ponytail.
              </p>
              <Link
                to="/admin/products/new"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-body text-xs uppercase tracking-[0.18em] text-primary-foreground"
              >
                <PlusCircle size={14} />
                Add Product
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {products.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <img src={product.image} alt={product.name} className="h-16 w-16 rounded-2xl object-cover" />
                    <div>
                      <p className="font-display text-lg font-semibold text-foreground">{product.name}</p>
                      <p className="mt-1 font-body text-sm text-muted-foreground">
                        {product.textureStyle} | Base GHS {product.price} | Stock {product.stock}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/admin/products/${product.id}/edit`}
                    className="rounded-full border border-border bg-card px-4 py-2 text-center font-body text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-background"
                  >
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[1.75rem] border border-border/60 bg-card/90 p-6 backdrop-blur">
          <h2 className="font-display text-2xl font-semibold text-foreground">Quick Actions</h2>
          <p className="mt-1 font-body text-sm text-muted-foreground">
            Jump straight to the tasks you use most.
          </p>

          <div className="mt-5 space-y-3">
            <ActionLink to="/admin/products/new" label="Add New Product" icon={PlusCircle} />
            <ActionLink to="/admin/products" label="Manage Products" icon={Package} />
            <ActionLink to="/admin/sales" label="Prepare Sales Launch" icon={BadgePercent} />
            <ActionLink to="/admin/settings" label="Store Settings & Content" icon={Settings} />
          </div>
        </section>
      </div>
    </AdminShell>
  );
};

const SummaryCard = ({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) => (
  <div className="rounded-[1.75rem] border border-border/60 bg-card/90 p-5 backdrop-blur">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="font-body text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
        <p className="mt-3 font-display text-4xl font-semibold text-foreground">{value}</p>
        <p className="mt-2 font-body text-sm text-muted-foreground">{hint}</p>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background text-foreground">
        <Icon size={18} />
      </div>
    </div>
  </div>
);

const ActionLink = ({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) => (
  <Link
    to={to}
    className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 px-4 py-4 font-body text-sm text-foreground transition-colors hover:bg-background"
  >
    <span className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-card">
        <Icon size={16} />
      </span>
      {label}
    </span>
    <span className="font-body text-xs uppercase tracking-[0.18em] text-muted-foreground">Open</span>
  </Link>
);

export default AdminDashboard;
