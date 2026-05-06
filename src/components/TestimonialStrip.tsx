import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "@/lib/api";
import type { StoreReview } from "@/types/review";

const TestimonialStrip = () => {
  const [quotes, setQuotes] = useState<StoreReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadReviews = async () => {
      try {
        const response = await apiRequest<{ items: StoreReview[] }>("/reviews?status=APPROVED");
        if (!isMounted) return;
        setQuotes(response.items.slice(0, 3));
      } catch {
        if (!isMounted) return;
        setQuotes([]);
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
    <section className="section-solid py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="mb-3 font-body text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Loved By Many
          </p>
          <h2 className="font-display text-4xl font-light text-foreground md:text-5xl">
            Happy <span className="italic font-semibold">Clients</span>
          </h2>
        </motion.div>

        {isLoading ? (
          <div className="rounded-2xl border border-border/60 bg-card/80 p-8 text-center backdrop-blur">
            <p className="font-body text-sm text-muted-foreground">Loading reviews...</p>
          </div>
        ) : quotes.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card/80 p-8 text-center backdrop-blur">
            <p className="font-body text-sm text-muted-foreground">
              Approved customer reviews will appear here.
            </p>
          </div>
        ) : (
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {quotes.map((quote, index) => (
              <motion.div
                key={quote.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="px-4 text-center"
              >
                <div className="mb-4 flex justify-center gap-0.5">
                  {Array.from({ length: quote.rating }).map((_, starIndex) => (
                    <Star key={starIndex} size={14} className="fill-accent text-accent" />
                  ))}
                </div>
                <p className="mb-4 font-body italic leading-relaxed text-foreground">
                  "{quote.text}"
                </p>
                <p className="font-display text-sm font-semibold text-muted-foreground">
                  - {quote.customerName}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            to="/about#reviews"
            className="border-b border-muted-foreground pb-1 font-body text-sm uppercase tracking-wider text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            Read More Reviews
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TestimonialStrip;
