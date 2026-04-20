import { motion } from "framer-motion";
import { MessageCircle, Phone } from "lucide-react";

const WHATSAPP_NUMBER = "233245722721";

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
          <p className="font-body text-sm tracking-[0.3em] uppercase text-muted-foreground mb-3">Get in Touch</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mb-6">
            Ready to <span className="italic font-semibold">Order?</span>
          </h2>
          <p className="font-body text-muted-foreground text-lg leading-relaxed mb-10">
            Ordering is simple — browse our collection, add to cart, and complete your order via WhatsApp. We accept <strong className="text-foreground">Mobile Money</strong> payments for a seamless experience. No account needed!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Dees_ponytails! I'd like to place an order.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-accent text-accent-foreground px-8 py-3.5 rounded font-body text-sm tracking-wider uppercase hover:opacity-90 transition-opacity"
            >
              <MessageCircle size={18} />
              Order on WhatsApp
            </a>
            <a
              href="tel:0245722721"
              className="flex items-center gap-2 border border-border text-foreground px-8 py-3.5 rounded font-body text-sm tracking-wider uppercase hover:bg-secondary transition-colors"
            >
              <Phone size={18} />
              Call Us
            </a>
          </div>

          <div className="flex items-center justify-center gap-6">
            <a
              href="https://instagram.com/dees_ponytails"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              @dees_ponytails
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
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
