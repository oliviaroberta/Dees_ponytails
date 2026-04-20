const tickerItems = [
  "Luxury ponytail extensions",
  "Soft textures",
  "Body wave and sleek styles",
  "Direct website checkout",
  "Mobile Money payment",
  "Premium finish",
];

const loopedItems = [...tickerItems, ...tickerItems];

const HeroTicker = () => {
  return (
    <section className="section-transparent h-11 py-0 md:h-12">
      <div className="w-full">
        <div className="h-full overflow-hidden border-y border-primary/20 bg-primary/90 backdrop-blur-sm">
          <div className="hero-ticker-track">
            {loopedItems.map((item, index) => (
              <div key={`${item}-${index}`} className="hero-ticker-item">
                <span className="hero-ticker-dot" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroTicker;
