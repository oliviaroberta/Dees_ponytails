import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import AboutSection from "@/components/AboutSection";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";
import PageBackButton from "@/components/PageBackButton";
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
          <div className="container mx-auto px-4 pt-6 lg:px-8">
            <PageBackButton fallbackTo="/" />
          </div>
          <AboutSection />
          <ReviewsSection />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default About;
