import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Store } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextPath = (location.state as { from?: string } | null)?.from || "/admin";

  if (isAuthenticated) {
    return <Navigate to={nextPath} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-border/60 bg-card/95 p-8 shadow-[0_24px_80px_rgba(32,20,10,0.08)] backdrop-blur">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Store size={24} />
          </div>
          <p className="mt-4 font-body text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Dees_ponytails Admin
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-foreground">Sign In</h1>
          <p className="mt-2 font-body text-sm text-muted-foreground">
            Use your admin credentials to manage products, sales, and storefront content.
          </p>
        </div>

        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setError(null);
            setIsSubmitting(true);

            try {
              await login(email, password);
              navigate(nextPath, { replace: true });
            } catch (submitError) {
              setError(submitError instanceof Error ? submitError.message : "Login failed");
            } finally {
              setIsSubmitting(false);
            }
          }}
          className="space-y-5"
        >
          <Field label="Email" value={email} onChange={setEmail} type="email" />
          <Field label="Password" value={password} onChange={setPassword} type="password" />

          {error ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 font-body text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-primary px-6 py-3.5 font-body text-sm uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

const Field = ({
  label,
  value,
  onChange,
  type,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type: string;
}) => (
  <div>
    <label className="mb-1.5 block font-body text-xs uppercase tracking-[0.18em] text-muted-foreground">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-foreground"
    />
  </div>
);

export default AdminLogin;
