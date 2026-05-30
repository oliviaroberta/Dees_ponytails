import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import backgroundImage from "@/assets/background.jpg";
import { API_BASE_URL, apiRequest } from "@/lib/api";
import { useCart } from "@/context/CartContext";

type VerificationState =
  | { status: "loading" }
  | { status: "success"; reference: string; customerName: string; phone: string }
  | { status: "error"; message: string };

const CheckoutCallback = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [state, setState] = useState<VerificationState>({ status: "loading" });

  useEffect(() => {
    const reference = searchParams.get("reference")?.trim();

    if (!reference) {
      setState({ status: "error", message: "Missing payment reference." });
      return;
    }

    let isMounted = true;

    const verifyPayment = async () => {
      try {
        const encodedReference = encodeURIComponent(reference);
        const verifyPath = `/payments/verify/${encodedReference}`;
        console.log("[checkout-callback] verifying payment", {
          reference,
          verifyUrl: `${API_BASE_URL}${verifyPath}`,
        });

        const response = await apiRequest<{
          verified: boolean;
          message: string;
          item: {
            reference: string;
            customerName: string;
            customerPhone: string;
          };
        }>(verifyPath);

        if (!isMounted) {
          return;
        }

        if (!response.verified) {
          setState({ status: "error", message: response.message });
          return;
        }

        clearCart();
        setState({
          status: "success",
          reference: response.item.reference,
          customerName: response.item.customerName,
          phone: response.item.customerPhone,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Unable to verify payment",
        });
      }
    };

    void verifyPayment();

    return () => {
      isMounted = false;
    };
  }, [clearCart, searchParams]);

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
      <div className="absolute inset-0 bg-background/80" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center">
          <div className="container mx-auto max-w-xl px-4 pb-20 pt-32 text-center lg:px-8">
            {state.status === "loading" ? (
              <>
                <LoaderCircle size={56} className="mx-auto mb-6 animate-spin text-accent" />
                <h1 className="mb-3 font-display text-4xl font-semibold text-foreground">
                  Verifying Payment
                </h1>
                <p className="font-body text-sm text-muted-foreground">
                  Please wait while we confirm your payment with Paystack.
                </p>
              </>
            ) : null}

            {state.status === "success" ? (
              <>
                <CheckCircle2 size={64} className="mx-auto mb-6 text-accent" />
                <h1 className="mb-3 font-display text-4xl font-semibold text-foreground">
                  Payment Confirmed
                </h1>
                <p className="mb-2 font-body text-muted-foreground">
                  Thank you, {state.customerName.split(" ")[0] || "love"}.
                </p>
                <p className="mb-8 font-body text-sm text-muted-foreground">
                  Your order reference is{" "}
                  <span className="font-medium text-foreground">{state.reference}</span>. We&apos;ll
                  send delivery updates to {state.phone}.
                </p>
                <Link
                  to="/shop"
                  className="inline-block rounded bg-primary px-8 py-3 font-body text-sm uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Continue Shopping
                </Link>
              </>
            ) : null}

            {state.status === "error" ? (
              <>
                <XCircle size={64} className="mx-auto mb-6 text-destructive" />
                <h1 className="mb-3 font-display text-4xl font-semibold text-foreground">
                  Payment Not Confirmed
                </h1>
                <p className="mb-8 font-body text-sm text-muted-foreground">{state.message}</p>
                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Link
                    to="/checkout"
                    className="inline-block rounded bg-primary px-8 py-3 font-body text-sm uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Try Again
                  </Link>
                  <Link
                    to="/shop"
                    className="inline-block rounded border border-border px-8 py-3 font-body text-sm uppercase tracking-wider text-foreground transition-colors hover:border-foreground"
                  >
                    Back to Shop
                  </Link>
                </div>
              </>
            ) : null}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default CheckoutCallback;
