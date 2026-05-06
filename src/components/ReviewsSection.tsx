import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { apiRequest } from "@/lib/api";
import type { StoreReview } from "@/types/review";

const ReviewsSection = () => {
  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadReviews = async () => {
      try {
        const response = await apiRequest<{ items: StoreReview[] }>("/reviews?status=APPROVED");
        if (!isMounted) return;
        setReviews(response.items);
      } catch {
        if (!isMounted) return;
        setReviews([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="reviews" className="section-solid py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <p className="mb-3 font-body text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Testimonials
          </p>
          <h2 className="font-display text-4xl font-light text-foreground md:text-5xl">
            What Our <span className="italic font-semibold">Clients</span> Say
          </h2>
        </motion.div>

        {isLoading ? (
          <div className="rounded-2xl border border-border/60 bg-card/80 p-8 text-center backdrop-blur">
            <p className="font-body text-sm text-muted-foreground">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card/80 p-8 text-center backdrop-blur">
            <p className="font-body text-sm text-muted-foreground">
              No approved reviews yet.
            </p>
          </div>
        ) : (
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-lg bg-secondary/40 p-6"
              >
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: review.rating }).map((_, starIndex) => (
                    <Star key={starIndex} size={16} className="fill-accent text-accent" />
                  ))}
                </div>
                <p className="mb-4 font-body leading-relaxed text-foreground">"{review.text}"</p>
                <p className="font-display text-sm font-semibold text-muted-foreground">
                  - {review.customerName}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewsSection;
