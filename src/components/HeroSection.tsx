import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

const slides = [hero1, hero2, hero3];

const HeroSection = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="section-transparent pb-0 pt-16">
      <div className="w-full">
        <div className="relative h-[calc(100svh-4rem-2.75rem)] min-h-[24rem] overflow-hidden md:h-[calc(100svh-4rem-3rem)]">
          <AnimatePresence mode="wait">
            <motion.img
              key={index}
              src={slides[index]}
              alt="Premium ponytail extension showcase"
              width={1600}
              height={1000}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black/55" />

          <div className="relative z-10 flex h-full items-center justify-center px-6 py-10 text-center md:px-10 lg:px-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <p className="mb-4 font-body text-sm uppercase tracking-[0.3em] text-white/80">
                Premium Ponytail Extensions
              </p>
              <h1 className="mb-4 font-display text-4xl font-light leading-tight text-white md:text-5xl lg:text-6xl">
                Luxury Hair That Moves
                <br />
                <span className="font-semibold">With You</span>
              </h1>
              <p className="mx-auto mb-6 max-w-2xl font-body text-base leading-relaxed text-white/85 lg:text-lg">
                Soft, reusable ponytail extensions designed for elegant everyday
                glam, birthdays, events, and effortless styling.
              </p>
              <Link
                to="/shop"
                className="inline-block rounded-sm bg-white px-8 py-3.5 font-body text-sm uppercase tracking-[0.22em] text-foreground transition-all hover:bg-white/92"
              >
                Shop Ponytails
              </Link>
            </motion.div>
          </div>

          <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-8 bg-white" : "w-2 bg-white/45"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
