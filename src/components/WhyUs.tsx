import { motion } from "framer-motion";
import { Sparkles, Truck, Smartphone, MapPin } from "lucide-react";

const items = [
  { icon: Sparkles, title: "Premium Quality", text: "Handpicked, soft, tangle-free hair that lasts." },
  { icon: Truck, title: "Fast Delivery", text: "Quick nationwide delivery across Ghana." },
  { icon: Smartphone, title: "Mobile Money", text: "Easy, secure payment via MoMo." },
  { icon: MapPin, title: "Proudly Ghanaian", text: "Locally based, customer-first service." },
];

const WhyUs = () => {
  return (
    <section className="section-solid py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="font-body text-sm tracking-[0.3em] uppercase text-muted-foreground mb-3">
            Why Dees_ponytails
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-foreground">
            Made for the <span className="italic font-semibold">Modern Woman</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary mb-5">
                <item.icon size={22} className="text-accent" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {item.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
