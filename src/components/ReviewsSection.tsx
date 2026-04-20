import { motion } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  { name: "Ama K.", text: "Best ponytail I've ever worn! So natural and the quality is insane. Will definitely order again.", rating: 5 },
  { name: "Nana A.", text: "I ordered the body wave and I'm in love. It blends perfectly with my hair. Dees is the real deal!", rating: 5 },
  { name: "Efua M.", text: "Fast delivery, great communication on WhatsApp, and the ponytail is absolutely gorgeous.", rating: 5 },
  { name: "Akosua B.", text: "The deep curl ponytail is everything! I get compliments everywhere I go. Thank you Dees!", rating: 5 },
];

const ReviewsSection = () => {
  return (
    <section id="reviews" className="section-solid py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="font-body text-sm tracking-[0.3em] uppercase text-muted-foreground mb-3">Testimonials</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-foreground">
            What Our <span className="italic font-semibold">Clients</span> Say
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {reviews.map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-secondary/40 rounded-lg p-6"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star key={j} size={16} className="fill-accent text-accent" />
                ))}
              </div>
              <p className="font-body text-foreground leading-relaxed mb-4">"{review.text}"</p>
              <p className="font-display text-sm font-semibold text-muted-foreground">— {review.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
