import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBackButton from "@/components/PageBackButton";
import backgroundImage from "@/assets/background.jpg";
import { useCurrency } from "@/context/CurrencyContext";
import { CreditCard, Smartphone, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";

type PayMethod = "momo" | "card";

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { formatPrice } = useCurrency();

  const [method, setMethod] = useState<PayMethod>("momo");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [orderRef, setOrderRef] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    momoNumber: "",
    momoNetwork: "MTN",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast({ title: "Your cart is empty", description: "Add some ponytails first." });
      return;
    }

    setSubmitError(null);
    setSubmitting(true);
    try {
      const response = await apiRequest<{
        item: { reference: string };
      }>("/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName: form.name,
          customerPhone: form.phone,
          customerEmail: form.email,
          address: form.address,
          city: form.city,
          paymentMethod: method === "momo" ? "MOMO" : "CARD",
          notes:
            method === "momo"
              ? `MoMo ${form.momoNetwork} - ${form.momoNumber}`
              : `Card checkout requested by ${form.cardName}`,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            color: item.color,
            length: item.length,
          })),
        }),
      });

      setOrderRef(response.item.reference);
      setDone(true);
      clearCart();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to place order";
      setSubmitError(message);
      toast({ title: "Order failed", description: message });
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <PageShell overlayClassName="bg-background/80">
        <main className="flex flex-1 items-center">
          <div className="container mx-auto max-w-xl px-4 pb-20 pt-32 text-center lg:px-8">
            <CheckCircle2 size={64} className="mx-auto mb-6 text-accent" />
            <h1 className="mb-3 font-display text-4xl font-semibold text-foreground">
              Order Confirmed
            </h1>
            <p className="mb-2 font-body text-muted-foreground">
              Thank you, {form.name.split(" ")[0] || "love"}!
            </p>
            <p className="mb-8 font-body text-sm text-muted-foreground">
              Your order reference is <span className="font-medium text-foreground">{orderRef}</span>.
              We&apos;ll send delivery updates to {form.phone}.
            </p>
            <Link
              to="/shop"
              className="inline-block rounded bg-primary px-8 py-3 font-body text-sm uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell overlayClassName="bg-background/75">
      <main className="flex-1">
        <div className="container mx-auto px-4 pb-16 pt-28 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6">
              <PageBackButton fallbackTo="/shop" />
            </div>
            <h1 className="mb-2 font-display text-4xl font-light text-foreground">
              Check<span className="font-semibold italic">out</span>
            </h1>
            <p className="mb-10 font-body text-muted-foreground">Secure in-app payment.</p>

            <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1fr_380px]">
              <div className="space-y-8">
                {submitError ? (
                  <section className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                    <p className="font-body text-sm text-destructive">{submitError}</p>
                  </section>
                ) : null}
                <section className="rounded-lg border border-border/60 bg-card/80 p-6 backdrop-blur">
                  <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
                    Contact & Delivery
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full Name" required value={form.name} onChange={(v) => update("name", v)} />
                    <Field label="Phone" required value={form.phone} onChange={(v) => update("phone", v)} placeholder="0245 ..." />
                    <Field label="Email (optional)" type="email" value={form.email} onChange={(v) => update("email", v)} className="sm:col-span-2" />
                    <Field label="Delivery Address" required value={form.address} onChange={(v) => update("address", v)} className="sm:col-span-2" />
                    <Field label="City / Region" required value={form.city} onChange={(v) => update("city", v)} className="sm:col-span-2" />
                  </div>
                </section>

                <section className="rounded-lg border border-border/60 bg-card/80 p-6 backdrop-blur">
                  <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Payment</h2>

                  <div className="mb-5 grid grid-cols-2 gap-3">
                    <PayOption
                      active={method === "momo"}
                      onClick={() => setMethod("momo")}
                      icon={<Smartphone size={18} />}
                      label="Mobile Money"
                    />
                    <PayOption
                      active={method === "card"}
                      onClick={() => setMethod("card")}
                      icon={<CreditCard size={18} />}
                      label="Card"
                    />
                  </div>

                  {method === "momo" ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block font-body text-xs uppercase tracking-wider text-muted-foreground">
                          Network
                        </label>
                        <select
                          value={form.momoNetwork}
                          onChange={(e) => update("momoNetwork", e.target.value)}
                          className="w-full rounded border border-border bg-background px-3 py-2.5 font-body text-sm text-foreground"
                        >
                          <option>MTN</option>
                          <option>Vodafone</option>
                          <option>AirtelTigo</option>
                        </select>
                      </div>
                      <Field
                        label="MoMo Number"
                        required
                        value={form.momoNumber}
                        onChange={(v) => update("momoNumber", v)}
                        placeholder="0245 ..."
                      />
                      <p className="font-body text-xs text-muted-foreground sm:col-span-2">
                        You&apos;ll receive a prompt on your phone to authorize the payment.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Cardholder Name" required value={form.cardName} onChange={(v) => update("cardName", v)} className="sm:col-span-2" />
                      <Field label="Card Number" required value={form.cardNumber} onChange={(v) => update("cardNumber", v)} placeholder="1234 5678 9012 3456" className="sm:col-span-2" />
                      <Field label="Expiry" required value={form.cardExpiry} onChange={(v) => update("cardExpiry", v)} placeholder="MM/YY" />
                      <Field label="CVV" required value={form.cardCvv} onChange={(v) => update("cardCvv", v)} placeholder="123" />
                    </div>
                  )}
                </section>
              </div>

              <aside className="h-fit rounded-lg border border-border/60 bg-card/90 p-6 backdrop-blur lg:sticky lg:top-24">
                <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
                  Order Summary
                </h2>

                {items.length === 0 ? (
                  <p className="py-4 font-body text-sm text-muted-foreground">Your cart is empty.</p>
                ) : (
                  <div className="mb-4 max-h-64 space-y-3 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.lineId} className="flex gap-3 font-body text-sm">
                        <img src={item.image} alt={item.name} className="h-12 w-12 rounded object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.color} - {item.length} - x{item.quantity}
                          </p>
                        </div>
                        <span className="text-foreground">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2 border-t border-border pt-4 font-body text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery</span>
                    <span>Calculated on confirmation</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-foreground">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || items.length === 0}
                  className="mt-5 w-full rounded bg-accent py-3 font-body text-sm uppercase tracking-wider text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Processing..." : `Pay ${formatPrice(total)}`}
                </button>
                <p className="mt-3 text-center font-body text-xs text-muted-foreground">
                  Secure checkout - Your details are encrypted
                </p>
              </aside>
            </form>
          </div>
        </div>
      </main>
    </PageShell>
  );
};

const PageShell = ({
  children,
  overlayClassName,
}: {
  children: React.ReactNode;
  overlayClassName: string;
}) => (
  <div
    className="relative min-h-screen"
    style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    }}
  >
    <div className={`absolute inset-0 ${overlayClassName}`} />
    <div className="relative z-10 flex min-h-screen flex-col">
      <Navbar />
      {children}
      <Footer />
    </div>
  </div>
);

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) => (
  <div className={className}>
    <label className="mb-1.5 block font-body text-xs uppercase tracking-wider text-muted-foreground">
      {label} {required && <span className="text-accent">*</span>}
    </label>
    <input
      type={type}
      required={required}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded border border-border bg-background px-3 py-2.5 font-body text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
    />
  </div>
);

const PayOption = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center justify-center gap-2 rounded border py-3 font-body text-sm transition-colors ${
      active
        ? "border-foreground bg-foreground text-background"
        : "border-border text-foreground hover:border-foreground"
    }`}
  >
    {icon}
    {label}
  </button>
);

export default Checkout;
