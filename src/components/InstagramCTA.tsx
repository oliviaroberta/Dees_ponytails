import { motion } from "framer-motion";
import { INSTAGRAM_URL, TIKTOK_URL } from "@/lib/contact";

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
            See styling inspiration, new arrivals, and real customer looks on our Instagram and TikTok.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={INSTAGRAM_URL}
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
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-border px-10 py-3.5 rounded font-body text-sm tracking-wider uppercase text-foreground hover:bg-secondary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.35V2h-3.05v13.24a2.75 2.75 0 1 1-2.75-2.75c.29 0 .57.04.84.13V9.53a5.82 5.82 0 1 0 4.96 5.71V8.57a7.82 7.82 0 0 0 4.58 1.48V6.99c-.28 0-.56-.1-.81-.3Z" />
              </svg>
              Follow on TikTok
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default InstagramCTA;
