import AdminShell from "@/components/admin/AdminShell";

const AdminSettings = () => {
  return (
    <AdminShell
      title="Settings"
      description="Control store-wide options such as contact details, payment preferences, and branding."
    >
      <section className="rounded-2xl border border-border/60 bg-card/90 p-8 backdrop-blur">
        <h2 className="font-display text-2xl font-semibold text-foreground">Settings Placeholder</h2>
        <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground">
          This page is reserved for future store settings like payment setup, WhatsApp number,
          branding, and admin preferences.
        </p>
      </section>
    </AdminShell>
  );
};

export default AdminSettings;
