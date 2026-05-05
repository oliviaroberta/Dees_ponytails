import { motion } from "framer-motion";
import { Sparkles, Heart, Shield } from "lucide-react";
import { useSiteContent } from "@/context/SiteContentContext";

const featureIcons = [Sparkles, Heart, Shield];

const AboutSection = () => {
  const {
    content: { about },
  } = useSiteContent();

  return (
    <section id="about" className="section-transparent py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <p className="mb-3 font-body text-sm uppercase tracking-[0.3em] text-muted-foreground">
            {about.eyebrow}
          </p>
          <h2 className="mb-6 font-display text-4xl font-light text-foreground md:text-5xl">
            {about.title} <span className="italic font-semibold">{about.titleHighlight}</span>
          </h2>
          <p className="mx-auto max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
            {about.description}
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-3">
          {about.features.map((feature, index) => {
            const Icon = featureIcons[index] ?? Sparkles;

            return (
              <motion.div
                key={`${feature.title}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="text-center"
              >
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                  <Icon size={24} className="text-accent" />
                </div>
                <h3 className="mb-2 font-display text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="font-body text-sm leading-relaxed text-muted-foreground">
                  {feature.text}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
