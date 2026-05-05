import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, PlusCircle, FileText, BadgePercent, ClipboardList, MessageSquareQuote, Settings, Store } from "lucide-react";
import backgroundImage from "@/assets/background.jpg";

const navItems = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, group: "Overview" },
  { label: "Products", to: "/admin/products", icon: Package, group: "Catalog" },
  { label: "Add Product", to: "/admin/products/new", icon: PlusCircle, group: "Catalog" },
  { label: "Content", to: "/admin/content", icon: FileText, group: "Storefront" },
  { label: "Sales", to: "/admin/sales", icon: BadgePercent, group: "Storefront" },
  { label: "Orders", to: "/admin/orders", icon: ClipboardList, group: "Operations" },
  { label: "Reviews", to: "/admin/reviews", icon: MessageSquareQuote, group: "Operations" },
  { label: "Settings", to: "/admin/settings", icon: Settings, group: "Operations" },
];

const navGroups = ["Overview", "Catalog", "Storefront", "Operations"];

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
      <div className="absolute inset-0 bg-background/88" />
      <div className="relative z-10">
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/90 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <Store size={22} />
                </div>
                <div>
                  <p className="font-body text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
                    Dees_ponytails Admin
                  </p>
                  <p className="mt-1 font-display text-2xl font-semibold text-foreground">
                    Store Control Panel
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-border/60 bg-card/80 px-4 py-2 font-body text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Frontend Only
                </div>
                <Link
                  to="/"
                  className="rounded-full border border-border bg-background/70 px-4 py-2 font-body text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  Back to Store
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 lg:px-8">
          <div className="mb-6 overflow-x-auto pb-2 lg:hidden">
            <div className="flex min-w-max gap-2">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.to ||
                  (item.to !== "/admin" && location.pathname.startsWith(item.to));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 font-body text-xs uppercase tracking-[0.18em] transition-colors ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border/60 bg-card/85 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon size={14} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="hidden h-fit rounded-[1.75rem] border border-border/60 bg-card/90 p-5 backdrop-blur lg:block">
              <div className="mb-5 rounded-2xl bg-background/70 p-4">
                <p className="font-body text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Workspace
                </p>
                <p className="mt-2 font-display text-xl font-semibold text-foreground">
                  Manage products, content, and launches
                </p>
              </div>

              <div className="space-y-5">
                {navGroups.map((group) => (
                  <div key={group}>
                    <p className="mb-2 px-2 font-body text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                      {group}
                    </p>
                    <div className="space-y-1.5">
                      {navItems
                        .filter((item) => item.group === group)
                        .map((item) => {
                          const isActive =
                            location.pathname === item.to ||
                            (item.to !== "/admin" && location.pathname.startsWith(item.to));
                          const Icon = item.icon;

                          return (
                            <Link
                              key={item.to}
                              to={item.to}
                              className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-body text-sm transition-colors ${
                                isActive
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:bg-background hover:text-foreground"
                              }`}
                            >
                              <Icon size={16} />
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            <main className="space-y-6">
              <div className="rounded-[1.75rem] border border-border/60 bg-card/90 p-6 backdrop-blur">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div className="max-w-3xl">
                    <p className="font-body text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                      Current Section
                    </p>
                    <h1 className="mt-2 font-display text-3xl font-semibold text-foreground lg:text-4xl">
                      {title}
                    </h1>
                    {description ? (
                      <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
                        {description}
                      </p>
                    ) : null}
                  </div>
                  {actions ? <div className="xl:shrink-0">{actions}</div> : null}
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
