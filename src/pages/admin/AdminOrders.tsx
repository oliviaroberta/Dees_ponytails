import AdminShell from "@/components/admin/AdminShell";

const AdminOrders = () => {
  return (
    <AdminShell
      title="Orders"
      description="Track customer orders here once the backend and payment flow are connected."
    >
      <section className="rounded-2xl border border-border/60 bg-card/90 p-8 backdrop-blur">
        <h2 className="font-display text-2xl font-semibold text-foreground">Orders Placeholder</h2>
        <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground">
          This page is ready for your future order management system. Later, it can show order
          status, payment state, customer details, and fulfillment progress.
        </p>
      </section>
    </AdminShell>
  );
};

export default AdminOrders;
