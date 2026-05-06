import { Suspense, lazy, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
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
const Index = lazy(() => import("./pages/Index"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutCallback = lazy(() => import("./pages/CheckoutCallback"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Sales = lazy(() => import("./pages/Sales"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminGallery = lazy(() => import("./pages/admin/AdminGallery"));
const AddProduct = lazy(() => import("./pages/admin/AddProduct"));
const EditProduct = lazy(() => import("./pages/admin/EditProduct"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminSales = lazy(() => import("./pages/admin/AdminSales"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const RouteLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background px-4">
    <p className="font-body text-sm uppercase tracking-[0.18em] text-muted-foreground">
      Loading...
    </p>
  </div>
);

const AppNavigationController = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

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
                    <Suspense fallback={<RouteLoader />}>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/shop/:id" element={<ProductDetails />} />
                        <Route path="/gallery" element={<Gallery />} />
                        <Route path="/sales" element={<Sales />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/checkout/callback" element={<CheckoutCallback />} />
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
                        <Route path="/admin/products" element={<ProtectedAdminRoute><AdminProducts /></ProtectedAdminRoute>} />
                        <Route path="/admin/gallery" element={<ProtectedAdminRoute><AdminGallery /></ProtectedAdminRoute>} />
                        <Route path="/admin/products/new" element={<ProtectedAdminRoute><AddProduct /></ProtectedAdminRoute>} />
                        <Route path="/admin/products/:id/edit" element={<ProtectedAdminRoute><EditProduct /></ProtectedAdminRoute>} />
                        <Route path="/admin/sales" element={<ProtectedAdminRoute><AdminSales /></ProtectedAdminRoute>} />
                        <Route path="/admin/orders" element={<ProtectedAdminRoute><AdminOrders /></ProtectedAdminRoute>} />
                        <Route path="/admin/reviews" element={<ProtectedAdminRoute><AdminReviews /></ProtectedAdminRoute>} />
                        <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
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
