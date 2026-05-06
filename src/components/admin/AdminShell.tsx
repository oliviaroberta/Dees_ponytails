import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, PlusCircle, BadgePercent, ClipboardList, MessageSquareQuote, Settings, Store, Menu, X, Images } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import backgroundImage from "@/assets/background.jpg";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, group: "Overview" },
  { label: "Products", to: "/admin/products", icon: Package, group: "Catalog" },
  { label: "Add Product", to: "/admin/products/new", icon: PlusCircle, group: "Catalog" },
  { label: "Gallery", to: "/admin/gallery", icon: Images, group: "Catalog" },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { admin, logout } = useAuth();

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
                {admin ? (
                  <div className="hidden rounded-full border border-border bg-background/70 px-4 py-2 font-body text-xs uppercase tracking-[0.16em] text-muted-foreground sm:block">
                    {admin.fullName}
                  </div>
                ) : null}
                <Link
                  to="/"
                  className="rounded-full border border-border bg-background/70 px-4 py-2 font-body text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  Back to Store
                </Link>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="rounded-full border border-border bg-background/70 px-4 py-2 font-body text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  Log Out
                </button>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((current) => !current)}
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70 text-foreground transition-colors hover:text-foreground lg:hidden"
                  aria-label="Toggle admin menu"
                >
                  {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 lg:px-8">
          <AnimatePresence>
            {mobileMenuOpen ? (
              <>
                <motion.button
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden"
                  aria-label="Close admin menu"
                />
                <motion.div
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="fixed inset-x-4 top-24 z-40 lg:hidden"
                >
                  <div className="mx-auto max-w-md rounded-[1.75rem] border border-border/60 bg-card/95 p-3 shadow-[0_18px_40px_rgba(32,24,19,0.12)] backdrop-blur-md">
                    <div className="space-y-4">
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
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center justify-between rounded-2xl px-4 py-3 font-body text-sm transition-colors ${
                                      isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-background hover:text-foreground"
                                    }`}
                                  >
                                    <span className="flex items-center gap-3">
                                      <Icon size={16} />
                                      <span>{item.label}</span>
                                    </span>
                                    <span className="text-xs tracking-normal">
                                      {isActive ? "•" : "+"}
                                    </span>
                                  </Link>
                                );
                              })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </>
            ) : null}
          </AnimatePresence>

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
