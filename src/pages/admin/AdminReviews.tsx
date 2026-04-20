import AdminShell from "@/components/admin/AdminShell";

const AdminReviews = () => {
  return (
    <AdminShell
      title="Reviews"
      description="Manage customer testimonials and featured reviews from one place."
    >
      <section className="rounded-2xl border border-border/60 bg-card/90 p-8 backdrop-blur">
        <h2 className="font-display text-2xl font-semibold text-foreground">Reviews Placeholder</h2>
        <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground">
          This page can later hold submitted reviews, approval actions, and featured testimonial
          controls for the storefront.
        </p>
      </section>
    </AdminShell>
  );
};

export default AdminReviews;
