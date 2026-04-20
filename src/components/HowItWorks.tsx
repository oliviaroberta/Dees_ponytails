import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Browse",
    text: "Explore our collection and look through the ponytail styles, textures, and lengths available.",
  },
  {
    num: "02",
    title: "Choose",
    text: "Pick the ponytail you want and continue the order process directly on the website.",
  },
  {
    num: "03",
    title: "Pay via MoMo",
    text: "Make your payment securely on the website through Mobile Money.",
  },
];

const HowItWorks = () => {
  return (
    <section className="section-transparent py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <p className="mb-3 font-body text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Simple Process
          </p>
          <h2 className="font-display text-4xl font-light text-foreground md:text-5xl">
            How It <span className="font-semibold italic">Works</span>
          </h2>
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <p className="mb-4 font-display text-5xl font-light text-accent">{step.num}</p>
              <h3 className="mb-3 font-display text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="mx-auto max-w-xs font-body text-sm leading-relaxed text-muted-foreground">
                {step.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
