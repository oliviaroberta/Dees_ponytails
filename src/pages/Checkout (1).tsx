import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import backgroundImage from "@/assets/background.jpg";
import { CreditCard, Smartphone, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type PayMethod = "momo" | "card";

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();

  const [method, setMethod] = useState<PayMethod>("momo");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [orderRef, setOrderRef] = useState("");

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

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast({ title: "Your cart is empty", description: "Add some ponytails first." });
      return;
    }
    setSubmitting(true);
    // Simulate processing
    setTimeout(() => {
      const ref = "DP-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      setOrderRef(ref);
      setDone(true);
      setSubmitting(false);
      clearCart();
    }, 1600);
  };

  if (done) {
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
        <div className="relative z-10">
          <Navbar />
          <div className="container mx-auto px-4 lg:px-8 pt-32 pb-20 max-w-xl text-center">
            <CheckCircle2 size={64} className="mx-auto text-accent mb-6" />
            <h1 className="font-display text-4xl font-semibold text-foreground mb-3">
              Order Confirmed
            </h1>
            <p className="font-body text-muted-foreground mb-2">
              Thank you, {form.name.split(" ")[0] || "love"}!
            </p>
            <p className="font-body text-sm text-muted-foreground mb-8">
              Your order reference is{" "}
              <span className="font-medium text-foreground">{orderRef}</span>. We'll send delivery
              updates to {form.phone}.
            </p>
            <Link
              to="/shop"
              className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded font-body text-sm tracking-wider uppercase hover:opacity-90 transition-opacity"
            >
              Continue Shopping
            </Link>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

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
      <div className="absolute inset-0 bg-background/75" />
      <div className="relative z-10">
        <Navbar />
        <div className="container mx-auto px-4 lg:px-8 pt-28 pb-16">
          <div className="max-w-5xl mx-auto">
            <h1 className="font-display text-4xl font-light text-foreground mb-2">
              Check<span className="italic font-semibold">out</span>
            </h1>
            <p className="font-body text-muted-foreground mb-10">Secure in-app payment.</p>

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_380px] gap-10">
              <div className="space-y-8">
                {/* Contact */}
                <section className="bg-card/80 backdrop-blur rounded-lg p-6 border border-border/60">
                  <h2 className="font-display text-lg font-semibold mb-4 text-foreground">
                    Contact & Delivery
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Full Name" required value={form.name} onChange={(v) => update("name", v)} />
                    <Field label="Phone" required value={form.phone} onChange={(v) => update("phone", v)} placeholder="0245 ..." />
                    <Field label="Email (optional)" type="email" value={form.email} onChange={(v) => update("email", v)} className="sm:col-span-2" />
                    <Field label="Delivery Address" required value={form.address} onChange={(v) => update("address", v)} className="sm:col-span-2" />
                    <Field label="City / Region" required value={form.city} onChange={(v) => update("city", v)} className="sm:col-span-2" />
                  </div>
                </section>

                {/* Payment */}
                <section className="bg-card/80 backdrop-blur rounded-lg p-6 border border-border/60">
                  <h2 className="font-display text-lg font-semibold mb-4 text-foreground">Payment</h2>

                  <div className="grid grid-cols-2 gap-3 mb-5">
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
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
                          Network
                        </label>
                        <select
                          value={form.momoNetwork}
                          onChange={(e) => update("momoNetwork", e.target.value)}
                          className="w-full bg-background border border-border rounded px-3 py-2.5 font-body text-sm text-foreground"
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
                      <p className="sm:col-span-2 text-xs text-muted-foreground font-body">
                        You'll receive a prompt on your phone to authorize the payment.
                      </p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Cardholder Name" required value={form.cardName} onChange={(v) => update("cardName", v)} className="sm:col-span-2" />
                      <Field label="Card Number" required value={form.cardNumber} onChange={(v) => update("cardNumber", v)} placeholder="1234 5678 9012 3456" className="sm:col-span-2" />
                      <Field label="Expiry" required value={form.cardExpiry} onChange={(v) => update("cardExpiry", v)} placeholder="MM/YY" />
                      <Field label="CVV" required value={form.cardCvv} onChange={(v) => update("cardCvv", v)} placeholder="123" />
                    </div>
                  )}
                </section>
              </div>

              {/* Summary */}
              <aside className="bg-card/90 backdrop-blur rounded-lg p-6 border border-border/60 h-fit lg:sticky lg:top-24">
                <h2 className="font-display text-lg font-semibold mb-4 text-foreground">
                  Order Summary
                </h2>

                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground font-body py-4">Your cart is empty.</p>
                ) : (
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {items.map((i) => (
                      <div key={i.id} className="flex gap-3 text-sm font-body">
                        <img src={i.image} alt={i.name} className="w-12 h-12 rounded object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{i.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {i.length} · x{i.quantity}
                          </p>
                        </div>
                        <span className="text-foreground">GH₵{i.price * i.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-border pt-4 space-y-2 font-body text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>GH₵{total}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery</span>
                    <span>Calculated on confirmation</span>
                  </div>
                  <div className="flex justify-between text-foreground text-base font-semibold pt-2 border-t border-border">
                    <span>Total</span>
                    <span>GH₵{total}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || items.length === 0}
                  className="w-full mt-5 bg-accent text-accent-foreground py-3 rounded font-body text-sm tracking-wider uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? "Processing…" : `Pay GH₵${total}`}
                </button>
                <p className="text-xs text-center text-muted-foreground font-body mt-3">
                  Secure checkout · Your details are encrypted
                </p>
              </aside>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

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
    <label className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">
      {label} {required && <span className="text-accent">*</span>}
    </label>
    <input
      type={type}
      required={required}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-background border border-border rounded px-3 py-2.5 font-body text-sm text-foreground focus:outline-none focus:border-foreground transition-colors"
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
    className={`flex items-center justify-center gap-2 py-3 rounded border font-body text-sm transition-colors ${
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
