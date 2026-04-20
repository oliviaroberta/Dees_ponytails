import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import HeroSection from "@/components/HeroSection";
import HeroTicker from "@/components/HeroTicker";
import FeaturedProducts from "@/components/FeaturedProducts";
import WhyUs from "@/components/WhyUs";
import HowItWorks from "@/components/HowItWorks";
import TestimonialStrip from "@/components/TestimonialStrip";
import InstagramCTA from "@/components/InstagramCTA";
import Footer from "@/components/Footer";
import backgroundImage from "@/assets/background.jpg";

const Index = () => {
  return (
    <div
      className="relative min-h-screen"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-background/70" />
      <div className="relative z-10">
        <Navbar />
        <CartDrawer />
        <HeroSection />
        <HeroTicker />
        <FeaturedProducts />
        <WhyUs />
        <HowItWorks />
        <TestimonialStrip />
        <InstagramCTA />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
