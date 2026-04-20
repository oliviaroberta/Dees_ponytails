import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import AboutSection from "@/components/AboutSection";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";
import backgroundImage from "@/assets/background.jpg";

const About = () => {
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
        <div className="pt-16">
          <AboutSection />
          <ReviewsSection />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default About;
