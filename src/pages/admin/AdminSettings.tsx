import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useSiteContent } from "@/context/SiteContentContext";
import { useAuth } from "@/context/AuthContext";

const AdminSettings = () => {
  const { content, updateContent, isLoading } = useSiteContent();
  const { admin, updateProfile, changePassword } = useAuth();
  const [hero, setHero] = useState(content.hero);
  const [howItWorks, setHowItWorks] = useState(content.howItWorks);
  const [about, setAbout] = useState(content.about);
  const [accountForm, setAccountForm] = useState({
    fullName: admin?.fullName ?? "",
    email: admin?.email ?? "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountSuccess, setAccountSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    setHero(content.hero);
    setHowItWorks(content.howItWorks);
    setAbout(content.about);
  }, [content]);

  useEffect(() => {
    setAccountForm({
      fullName: admin?.fullName ?? "",
      email: admin?.email ?? "",
    });
  }, [admin?.email, admin?.fullName]);

  const hasChanges = useMemo(
    () =>
      JSON.stringify(hero) !== JSON.stringify(content.hero) ||
      JSON.stringify(howItWorks) !== JSON.stringify(content.howItWorks) ||
      JSON.stringify(about) !== JSON.stringify(content.about),
    [about, content.about, content.hero, content.howItWorks, hero, howItWorks],
  );

  const hasAccountChanges = useMemo(
    () =>
      accountForm.fullName.trim() !== (admin?.fullName ?? "") ||
      accountForm.email.trim().toLowerCase() !== (admin?.email ?? "").toLowerCase(),
    [accountForm.email, accountForm.fullName, admin?.email, admin?.fullName],
  );

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);
    try {
      await updateContent({
        hero,
        howItWorks,
        about,
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAccountSave = async () => {
    setAccountError(null);
    setAccountSuccess(null);
    setIsSavingAccount(true);

    try {
      await updateProfile({
        fullName: accountForm.fullName.trim(),
        email: accountForm.email.trim(),
      });
      setAccountSuccess("Account details updated.");
    } catch (saveError) {
      setAccountError(saveError instanceof Error ? saveError.message : "Failed to update account");
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handlePasswordSave = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess("Password updated. Please log in again.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (saveError) {
      setPasswordError(saveError instanceof Error ? saveError.message : "Failed to update password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <AdminShell
      title="Settings"
      description="Manage the editable storefront content for the hero, how it works, and about us sections."
      actions={
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={!hasChanges || isSaving}
          className="rounded bg-primary px-5 py-2.5 font-body text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      }
    >
      {error ? (
        <section className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
          <p className="font-body text-sm text-destructive">{error}</p>
        </section>
      ) : null}
      {isLoading ? (
        <section className="rounded-2xl border border-border/60 bg-card/90 p-8 text-center backdrop-blur">
          <p className="font-body text-sm text-muted-foreground">Loading settings...</p>
        </section>
      ) : null}
      {!isLoading ? (
        <>
      <section className="rounded-[1.75rem] border border-border/60 bg-card/90 p-6 backdrop-blur">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">Admin Account</h2>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              Update the login email and display name used for this admin account.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleAccountSave()}
            disabled={!hasAccountChanges || isSavingAccount}
            className="rounded bg-primary px-5 py-2.5 font-body text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSavingAccount ? "Saving..." : "Save Account"}
          </button>
        </div>

        {accountError ? (
          <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
            <p className="font-body text-sm text-destructive">{accountError}</p>
          </div>
        ) : null}
        {accountSuccess ? (
          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/10 p-4">
            <p className="font-body text-sm text-foreground">{accountSuccess}</p>
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field
            label="Full Name"
            value={accountForm.fullName}
            onChange={(value) => setAccountForm((current) => ({ ...current, fullName: value }))}
          />
          <Field
            label="Login Email"
            value={accountForm.email}
            onChange={(value) => setAccountForm((current) => ({ ...current, email: value }))}
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-border/60 bg-card/90 p-6 backdrop-blur">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">Security</h2>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              Change the current admin password. You will be signed out after the change.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handlePasswordSave()}
            disabled={
              isChangingPassword ||
              !passwordForm.currentPassword ||
              !passwordForm.newPassword ||
              !passwordForm.confirmPassword
            }
            className="rounded bg-primary px-5 py-2.5 font-body text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isChangingPassword ? "Saving..." : "Change Password"}
          </button>
        </div>

        {passwordError ? (
          <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
            <p className="font-body text-sm text-destructive">{passwordError}</p>
          </div>
        ) : null}
        {passwordSuccess ? (
          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/10 p-4">
            <p className="font-body text-sm text-foreground">{passwordSuccess}</p>
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <PasswordField
            label="Current Password"
            value={passwordForm.currentPassword}
            onChange={(value) =>
              setPasswordForm((current) => ({ ...current, currentPassword: value }))
            }
          />
          <PasswordField
            label="New Password"
            value={passwordForm.newPassword}
            onChange={(value) => setPasswordForm((current) => ({ ...current, newPassword: value }))}
          />
          <PasswordField
            label="Confirm New Password"
            value={passwordForm.confirmPassword}
            onChange={(value) =>
              setPasswordForm((current) => ({ ...current, confirmPassword: value }))
            }
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-border/60 bg-card/90 p-6 backdrop-blur">
        <h2 className="font-display text-2xl font-semibold text-foreground">Hero Content</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Eyebrow" value={hero.eyebrow} onChange={(value) => setHero((current) => ({ ...current, eyebrow: value }))} />
          <Field label="CTA Label" value={hero.ctaLabel} onChange={(value) => setHero((current) => ({ ...current, ctaLabel: value }))} />
          <Field label="Title Line 1" value={hero.titleLine1} onChange={(value) => setHero((current) => ({ ...current, titleLine1: value }))} className="md:col-span-2" />
          <Field label="Title Highlight" value={hero.titleHighlight} onChange={(value) => setHero((current) => ({ ...current, titleHighlight: value }))} className="md:col-span-2" />
          <TextArea label="Description" value={hero.description} onChange={(value) => setHero((current) => ({ ...current, description: value }))} className="md:col-span-2" />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-border/60 bg-card/90 p-6 backdrop-blur">
        <h2 className="font-display text-2xl font-semibold text-foreground">How It Works</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Eyebrow" value={howItWorks.eyebrow} onChange={(value) => setHowItWorks((current) => ({ ...current, eyebrow: value }))} />
          <Field label="Title" value={howItWorks.title} onChange={(value) => setHowItWorks((current) => ({ ...current, title: value }))} />
          <Field label="Title Highlight" value={howItWorks.titleHighlight} onChange={(value) => setHowItWorks((current) => ({ ...current, titleHighlight: value }))} className="md:col-span-2" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {howItWorks.steps.map((step, index) => (
            <div key={step.num} className="rounded-2xl border border-border/60 bg-background/60 p-4">
              <p className="mb-4 font-body text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Step {step.num}
              </p>
              <Field
                label="Title"
                value={step.title}
                onChange={(value) =>
                  setHowItWorks((current) => ({
                    ...current,
                    steps: current.steps.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, title: value } : item,
                    ),
                  }))
                }
              />
              <TextArea
                label="Text"
                value={step.text}
                onChange={(value) =>
                  setHowItWorks((current) => ({
                    ...current,
                    steps: current.steps.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, text: value } : item,
                    ),
                  }))
                }
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-border/60 bg-card/90 p-6 backdrop-blur">
        <h2 className="font-display text-2xl font-semibold text-foreground">About Us</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Eyebrow" value={about.eyebrow} onChange={(value) => setAbout((current) => ({ ...current, eyebrow: value }))} />
          <Field label="Title" value={about.title} onChange={(value) => setAbout((current) => ({ ...current, title: value }))} />
          <Field label="Title Highlight" value={about.titleHighlight} onChange={(value) => setAbout((current) => ({ ...current, titleHighlight: value }))} className="md:col-span-2" />
          <TextArea label="Description" value={about.description} onChange={(value) => setAbout((current) => ({ ...current, description: value }))} className="md:col-span-2" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {about.features.map((feature, index) => (
            <div key={index} className="rounded-2xl border border-border/60 bg-background/60 p-4">
              <Field
                label="Feature Title"
                value={feature.title}
                onChange={(value) =>
                  setAbout((current) => ({
                    ...current,
                    features: current.features.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, title: value } : item,
                    ),
                  }))
                }
              />
              <TextArea
                label="Feature Text"
                value={feature.text}
                onChange={(value) =>
                  setAbout((current) => ({
                    ...current,
                    features: current.features.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, text: value } : item,
                    ),
                  }))
                }
              />
            </div>
          ))}
        </div>
      </section>
        </>
      ) : null}
    </AdminShell>
  );
};

const Field = ({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) => (
  <div className={className}>
    <label className="mb-1.5 block font-body text-xs uppercase tracking-[0.18em] text-muted-foreground">
      {label}
    </label>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
    />
  </div>
);

const PasswordField = ({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) => (
  <div className={className}>
    <label className="mb-1.5 block font-body text-xs uppercase tracking-[0.18em] text-muted-foreground">
      {label}
    </label>
    <input
      type="password"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
    />
  </div>
);

const TextArea = ({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) => (
  <div className={className}>
    <label className="mb-1.5 block font-body text-xs uppercase tracking-[0.18em] text-muted-foreground">
      {label}
    </label>
    <textarea
      rows={4}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
    />
  </div>
);

export default AdminSettings;
