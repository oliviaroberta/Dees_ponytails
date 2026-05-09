import { motion } from "framer-motion";
import { MessageCircle, Phone } from "lucide-react";
import { INSTAGRAM_URL, ORDER_WHATSAPP_MESSAGE, TIKTOK_URL, WHATSAPP_NUMBER } from "@/lib/contact";

const ContactSection = () => {
  return (
    <section id="contact" className="section-transparent py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="mb-3 font-body text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Get in Touch
          </p>
          <h2 className="mb-6 font-display text-4xl font-light text-foreground md:text-5xl">
            Ready to <span className="font-semibold italic">Order?</span>
          </h2>
          <p className="mb-10 font-body text-lg leading-relaxed text-muted-foreground">
            Ordering is simple — browse our collection, add your items to cart, and complete
            checkout securely online. We accept{" "}
            <strong className="text-foreground">Mobile Money</strong> and{" "}
            <strong className="text-foreground">card payments</strong> through Paystack, and
            you can still reach us on WhatsApp if you need help before or after ordering.
          </p>

          <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(ORDER_WHATSAPP_MESSAGE)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-lift flex items-center gap-2 rounded bg-accent px-8 py-3.5 font-body text-sm uppercase tracking-wider text-accent-foreground transition-opacity hover:opacity-90"
            >
              <MessageCircle size={18} />
              Order on WhatsApp
            </a>
            <a
              href="tel:0245722721"
              className="cta-lift flex items-center gap-2 rounded border border-border px-8 py-3.5 font-body text-sm uppercase tracking-wider text-foreground transition-colors hover:bg-secondary"
            >
              <Phone size={18} />
              Call Us
            </a>
          </div>

          <div className="flex items-center justify-center gap-6">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-body text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              @dees_ponytails
            </a>
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-body text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.35V2h-3.05v13.24a2.75 2.75 0 1 1-2.75-2.75c.29 0 .57.04.84.13V9.53a5.82 5.82 0 1 0 4.96 5.71V8.57a7.82 7.82 0 0 0 4.58 1.48V6.99c-.28 0-.56-.1-.81-.3Z" />
              </svg>
              TikTok
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-body text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <MessageCircle size={18} />
              0245722721
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
