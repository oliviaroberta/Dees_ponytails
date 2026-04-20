import { Link, useLocation } from "react-router-dom";
import backgroundImage from "@/assets/background.jpg";

const navItems = [
  { label: "Dashboard", to: "/admin" },
  { label: "Products", to: "/admin/products" },
  { label: "Add Product", to: "/admin/products/new" },
  { label: "Orders", to: "/admin/orders" },
  { label: "Reviews", to: "/admin/reviews" },
  { label: "Settings", to: "/admin/settings" },
];

const AdminShell = ({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) => {
  const location = useLocation();

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
      <div className="absolute inset-0 bg-background/85" />
      <div className="relative z-10">
        <header className="border-b border-border/60 bg-background/85 backdrop-blur-sm">
          <div className="container mx-auto flex items-center justify-between px-4 py-5 lg:px-8">
            <div>
              <p className="font-body text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Admin Dashboard
              </p>
              <p className="mt-1 font-display text-2xl font-semibold text-foreground">
                Dees_ponytails
              </p>
            </div>
            <Link
              to="/"
              className="rounded-full border border-border bg-background/70 px-4 py-2 font-body text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
            >
              Back to Store
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="h-fit rounded-2xl border border-border/60 bg-card/90 p-4 backdrop-blur">
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const isActive =
                    location.pathname === item.to ||
                    (item.to !== "/admin" && location.pathname.startsWith(item.to));

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`block rounded-xl px-4 py-3 font-body text-xs uppercase tracking-[0.2em] transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-background hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </aside>

            <main className="space-y-6">
              <div className="rounded-2xl border border-border/60 bg-card/90 p-6 backdrop-blur">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="font-display text-3xl font-semibold text-foreground">{title}</h1>
                    {description ? (
                      <p className="mt-1 font-body text-sm text-muted-foreground">{description}</p>
                    ) : null}
                  </div>
                  {actions}
                </div>
              </div>

              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminShell;
