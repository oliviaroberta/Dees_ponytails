import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import ShopSection from "@/components/ShopSection";
import Footer from "@/components/Footer";
import backgroundImage from "@/assets/background.jpg";

const Shop = () => {
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
          <ShopSection />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Shop;
