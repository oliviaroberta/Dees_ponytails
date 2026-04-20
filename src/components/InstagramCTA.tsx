import { motion } from "framer-motion";

const InstagramCTA = () => {
  return (
    <section className="section-transparent py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="font-body text-sm tracking-[0.3em] uppercase text-muted-foreground mb-3">
            Follow the Glam
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mb-5">
            <span className="italic font-semibold">@dees_ponytails</span>
          </h2>
          <p className="font-body text-muted-foreground text-lg leading-relaxed mb-8">
            See styling inspiration, new arrivals, and real customer looks on our Instagram.
          </p>
          <a
            href="https://instagram.com/dees_ponytails"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-foreground text-background px-10 py-3.5 rounded font-body text-sm tracking-wider uppercase hover:opacity-90 transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
            Follow on Instagram
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default InstagramCTA;
