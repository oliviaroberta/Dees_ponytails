import { useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProtectedAdminRoute from "@/components/admin/ProtectedAdminRoute";
import { CartProvider } from "@/context/CartContext";
import { AdminProductsProvider } from "@/context/AdminProductsContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { SiteContentProvider } from "@/context/SiteContentContext";
import { SalesProvider } from "@/context/SalesContext";
import { AuthProvider } from "@/context/AuthContext";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Checkout from "./pages/Checkout";
import CheckoutCallback from "./pages/CheckoutCallback";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminSales from "./pages/admin/AdminSales";
import AdminLogin from "./pages/admin/AdminLogin";
import Sales from "./pages/Sales";

const queryClient = new QueryClient();

const AppNavigationController = () => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const hasHandledReload = useRef(false);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (hasHandledReload.current) {
      return;
    }

    const navigationEntry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;

    if (navigationEntry?.type !== "reload") {
      hasHandledReload.current = true;
      return;
    }

    hasHandledReload.current = true;

    if (pathname.startsWith("/admin") && pathname !== "/admin" && pathname !== "/admin/login") {
      navigate("/admin", { replace: true });
      return;
    }

    if (!pathname.startsWith("/admin") && pathname !== "/") {
      navigate("/", { replace: true });
    }
  }, [navigate, pathname]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <CurrencyProvider>
            <SiteContentProvider>
              <SalesProvider>
                <CartProvider>
                  <AdminProductsProvider>
                    <Toaster />
                    <Sonner />
                    <AppNavigationController />
                    <FloatingWhatsApp />
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/shop/:id" element={<ProductDetails />} />
                      <Route path="/sales" element={<Sales />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/checkout/callback" element={<CheckoutCallback />} />
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
                      <Route path="/admin/products" element={<ProtectedAdminRoute><AdminProducts /></ProtectedAdminRoute>} />
                      <Route path="/admin/products/new" element={<ProtectedAdminRoute><AddProduct /></ProtectedAdminRoute>} />
                      <Route path="/admin/products/:id/edit" element={<ProtectedAdminRoute><EditProduct /></ProtectedAdminRoute>} />
                      <Route path="/admin/sales" element={<ProtectedAdminRoute><AdminSales /></ProtectedAdminRoute>} />
                      <Route path="/admin/orders" element={<ProtectedAdminRoute><AdminOrders /></ProtectedAdminRoute>} />
                      <Route path="/admin/reviews" element={<ProtectedAdminRoute><AdminReviews /></ProtectedAdminRoute>} />
                      <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AdminProductsProvider>
                </CartProvider>
              </SalesProvider>
            </SiteContentProvider>
          </CurrencyProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
