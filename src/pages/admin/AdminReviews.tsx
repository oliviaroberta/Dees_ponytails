import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";

type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

interface AdminReview {
  id: string;
  productId: string;
  productName: string | null;
  customerName: string;
  rating: number;
  text: string;
  status: ReviewStatus;
  createdAt: string;
}

const STATUS_OPTIONS: Array<{ value: "ALL" | ReviewStatus; label: string }> = [
  { value: "ALL", label: "All Reviews" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const AdminReviews = () => {
  const { accessToken } = useAuth();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [statusFilter, setStatusFilter] = useState<"ALL" | ReviewStatus>("PENDING");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyReviewId, setBusyReviewId] = useState<string | null>(null);

  const loadReviews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const query = statusFilter === "ALL" ? "" : `?status=${statusFilter}`;
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

  const filteredReviews = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return reviews;
    }

    return reviews.filter((review) =>
      [review.customerName, review.productName ?? "", review.text]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [reviews, search]);

  const stats = useMemo(
    () => ({
      total: reviews.length,
      pending: reviews.filter((review) => review.status === "PENDING").length,
      approved: reviews.filter((review) => review.status === "APPROVED").length,
      rejected: reviews.filter((review) => review.status === "REJECTED").length,
    }),
    [reviews],
  );

  const updateReviewStatus = async (reviewId: string, status: ReviewStatus) => {
    if (!accessToken) return;

    setBusyReviewId(reviewId);
    setError(null);

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
    } finally {
      setBusyReviewId(null);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!accessToken) return;

    setBusyReviewId(reviewId);
    setError(null);

    try {
      await apiRequest(`/reviews/${reviewId}`, {
        method: "DELETE",
        token: accessToken,
      });

      setReviews((current) => current.filter((review) => review.id !== reviewId));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete review");
    } finally {
      setBusyReviewId(null);
    }
  };

  return (
    <AdminShell
      title="Reviews"
      description="Approve, reject, or remove customer reviews before they appear across the storefront."
    >
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Visible Now" value={stats.approved} />
        <StatCard label="Needs Review" value={stats.pending} />
        <StatCard label="Rejected" value={stats.rejected} />
        <StatCard label="Loaded" value={stats.total} />
      </section>

      <section className="rounded-[1.75rem] border border-border/60 bg-card/90 p-5 backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "ALL" | ReviewStatus)}
            className="rounded-2xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-foreground"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by customer, product, or review text"
            className="rounded-2xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-foreground"
          />
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
      ) : filteredReviews.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border/70 bg-card/90 p-8 text-center backdrop-blur">
          <p className="font-body text-sm text-muted-foreground">No reviews found for this filter.</p>
        </section>
      ) : (
        <section className="space-y-4">
          {filteredReviews.map((review) => {
            const isBusy = busyReviewId === review.id;

            return (
              <article
                key={review.id}
                className="rounded-[1.75rem] border border-border/60 bg-card/90 p-5 backdrop-blur"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={review.status} />
                      <span className="rounded-full border border-border px-3 py-1 font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="font-display text-xl font-semibold text-foreground">
                        {review.customerName}
                      </p>
                      <p className="font-body text-sm text-muted-foreground">
                        Product: {review.productName ?? "Unknown product"}
                      </p>
                    </div>

                    <div className="flex gap-1">
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <span key={index} className="text-accent">
                          ★
                        </span>
                      ))}
                    </div>

                    <p className="max-w-3xl font-body text-sm leading-relaxed text-foreground/85">
                      "{review.text}"
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 xl:w-[430px]">
                    <button
                      type="button"
                      onClick={() => void updateReviewStatus(review.id, "APPROVED")}
                      disabled={isBusy || review.status === "APPROVED"}
                      className="rounded-full bg-primary px-4 py-2.5 font-body text-xs uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => void updateReviewStatus(review.id, "REJECTED")}
                      disabled={isBusy || review.status === "REJECTED"}
                      className="rounded-full border border-foreground/20 px-4 py-2.5 font-body text-xs uppercase tracking-[0.18em] text-foreground disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteReview(review.id)}
                      disabled={isBusy}
                      className="rounded-full border border-destructive/40 px-4 py-2.5 font-body text-xs uppercase tracking-[0.18em] text-destructive disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </AdminShell>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-[1.5rem] border border-border/60 bg-card/90 p-5 backdrop-blur">
    <p className="font-body text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
    <p className="mt-2 font-display text-3xl font-semibold text-foreground">{value}</p>
  </div>
);

const StatusBadge = ({ status }: { status: ReviewStatus }) => {
  const className =
    status === "APPROVED"
      ? "bg-primary text-primary-foreground"
      : status === "PENDING"
        ? "bg-accent text-accent-foreground"
        : "bg-secondary text-foreground";

  return (
    <span className={`rounded-full px-3 py-1 font-body text-[11px] uppercase tracking-[0.18em] ${className}`}>
      {status}
    </span>
  );
};

export default AdminReviews;
