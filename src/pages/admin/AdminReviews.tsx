import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";

type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

interface AdminReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  text: string;
  status: ReviewStatus;
  createdAt: string;
}

const AdminReviews = () => {
  const { accessToken } = useAuth();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [statusFilter, setStatusFilter] = useState<"ALL" | ReviewStatus>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const query = statusFilter === "ALL" ? "?status=PENDING" : `?status=${statusFilter}`;
      const response = await apiRequest<{ items: AdminReview[] }>(`/reviews${query}`);
      setReviews(response.items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadReviews();
  }, [statusFilter]);

  const updateReviewStatus = async (reviewId: string, status: ReviewStatus) => {
    if (!accessToken) return;

    try {
      const response = await apiRequest<{ item: AdminReview }>(`/reviews/${reviewId}/status`, {
        method: "PATCH",
        token: accessToken,
        body: JSON.stringify({ status }),
      });

      setReviews((current) =>
        current.map((review) => (review.id === reviewId ? response.item : review)),
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update review");
    }
  };

  return (
    <AdminShell
      title="Reviews"
      description="Review customer feedback, approve what should go live, and reject what should not."
    >
      <section className="rounded-2xl border border-border/60 bg-card/90 p-5 backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "ALL" | ReviewStatus)}
            className="rounded-2xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-foreground"
          >
            <option value="ALL">Pending First</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <div className="flex items-center rounded-2xl border border-border/60 bg-background/60 px-4 py-3 font-body text-sm text-muted-foreground">
            {reviews.length} review{reviews.length === 1 ? "" : "s"}
          </div>
        </div>
      </section>

      {error ? (
        <section className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
          <p className="font-body text-sm text-destructive">{error}</p>
        </section>
      ) : null}

      {isLoading ? (
        <section className="rounded-2xl border border-border/60 bg-card/90 p-8 text-center backdrop-blur">
          <p className="font-body text-sm text-muted-foreground">Loading reviews...</p>
        </section>
      ) : reviews.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border/70 bg-card/90 p-8 text-center backdrop-blur">
          <p className="font-body text-sm text-muted-foreground">No reviews found for this filter.</p>
        </section>
      ) : (
        <section className="space-y-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-[1.75rem] border border-border/60 bg-card/90 p-5 backdrop-blur"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div>
                    <p className="font-display text-xl font-semibold text-foreground">
                      {review.customerName}
                    </p>
                    <p className="mt-1 font-body text-sm text-muted-foreground">
                      Product ID: {review.productId}
                    </p>
                  </div>

                  <div className="flex gap-1">
                    {Array.from({ length: review.rating }).map((_, index) => (
                      <span key={index} className="text-accent">★</span>
                    ))}
                  </div>

                  <p className="font-body text-sm leading-relaxed text-foreground/85">
                    "{review.text}"
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:w-[360px]">
                  <button
                    type="button"
                    onClick={() => void updateReviewStatus(review.id, "APPROVED")}
                    className="rounded-full bg-primary px-4 py-2.5 font-body text-xs uppercase tracking-[0.18em] text-primary-foreground"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => void updateReviewStatus(review.id, "REJECTED")}
                    className="rounded-full border border-destructive/40 px-4 py-2.5 font-body text-xs uppercase tracking-[0.18em] text-destructive"
                  >
                    Reject
                  </button>
                  <div className="flex items-center justify-center rounded-full border border-border px-4 py-2.5 font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {review.status}
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

export default AdminReviews;
