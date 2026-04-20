import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import backgroundImage from "@/assets/background.jpg";

const Contact = () => {
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
          <ContactSection />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Contact;
