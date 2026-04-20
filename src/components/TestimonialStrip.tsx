import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";

const quotes = [
  { name: "Ama K.", text: "Best ponytail I've ever worn — so natural and the quality is insane." },
  { name: "Nana A.", text: "Blends perfectly with my hair. Dees is the real deal!" },
  { name: "Efua M.", text: "Fast delivery and absolutely gorgeous. I'm obsessed." },
];

const TestimonialStrip = () => {
  return (
    <section className="section-solid py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="font-body text-sm tracking-[0.3em] uppercase text-muted-foreground mb-3">
            Loved By Many
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-foreground">
            Happy <span className="italic font-semibold">Clients</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {quotes.map((q, i) => (
            <motion.div
              key={q.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center px-4"
            >
              <div className="flex justify-center gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={14} className="fill-accent text-accent" />
                ))}
              </div>
              <p className="font-body text-foreground leading-relaxed mb-4 italic">"{q.text}"</p>
              <p className="font-display text-sm font-semibold text-muted-foreground">— {q.name}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/about"
            className="font-body text-sm tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors border-b border-muted-foreground hover:border-foreground pb-1"
          >
            Read More Reviews
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TestimonialStrip;
