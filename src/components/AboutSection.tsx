import { motion } from "framer-motion";
import { Sparkles, Heart, Shield } from "lucide-react";

const features = [
  { icon: Sparkles, title: "Premium Quality", text: "Handpicked, high-grade hair that looks and feels natural." },
  { icon: Heart, title: "Made with Love", text: "Each ponytail is carefully crafted for a flawless, secure fit." },
  { icon: Shield, title: "Trusted by 500+", text: "Loved by women across Ghana who trust Dees_ponytails for their glam." },
];

const AboutSection = () => {
  return (
    <section id="about" className="section-transparent py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="font-body text-sm tracking-[0.3em] uppercase text-muted-foreground mb-3">About Us</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mb-6">
            The <span className="italic font-semibold">Dees_ponytails</span> Promise
          </h2>
          <p className="font-body text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg">
            We believe every woman deserves to feel confident and beautiful. Our ponytail extensions are sourced for quality, designed for comfort, and styled for impact — so you can slay effortlessly, every single day.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary mb-5">
                <f.icon size={24} className="text-accent" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
