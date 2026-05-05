import { useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useSiteContent } from "@/context/SiteContentContext";

const AdminContent = () => {
  const { content, updateHero, updateHowItWorks, updateAbout } = useSiteContent();
  const [hero, setHero] = useState(content.hero);
  const [howItWorks, setHowItWorks] = useState(content.howItWorks);
  const [about, setAbout] = useState(content.about);

  const hasChanges = useMemo(
    () =>
      JSON.stringify(hero) !== JSON.stringify(content.hero) ||
      JSON.stringify(howItWorks) !== JSON.stringify(content.howItWorks) ||
      JSON.stringify(about) !== JSON.stringify(content.about),
    [about, content.about, content.hero, content.howItWorks, hero, howItWorks],
  );

  const handleSave = () => {
    updateHero(hero);
    updateHowItWorks(howItWorks);
    updateAbout(about);
  };

  return (
    <AdminShell
      title="Content"
      description="Edit only the storefront text for the hero, how it works, and about us sections."
      actions={
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges}
          className="rounded bg-primary px-5 py-2.5 font-body text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Save Content
        </button>
      }
    >
      <section className="rounded-2xl border border-border/60 bg-card/90 p-6 backdrop-blur">
        <h2 className="font-display text-2xl font-semibold text-foreground">Hero</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Eyebrow" value={hero.eyebrow} onChange={(value) => setHero((current) => ({ ...current, eyebrow: value }))} />
          <Field label="CTA Label" value={hero.ctaLabel} onChange={(value) => setHero((current) => ({ ...current, ctaLabel: value }))} />
          <Field label="Title Line 1" value={hero.titleLine1} onChange={(value) => setHero((current) => ({ ...current, titleLine1: value }))} className="md:col-span-2" />
          <Field label="Title Highlight" value={hero.titleHighlight} onChange={(value) => setHero((current) => ({ ...current, titleHighlight: value }))} className="md:col-span-2" />
          <TextArea label="Description" value={hero.description} onChange={(value) => setHero((current) => ({ ...current, description: value }))} className="md:col-span-2" />
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/90 p-6 backdrop-blur">
        <h2 className="font-display text-2xl font-semibold text-foreground">How It Works</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Eyebrow" value={howItWorks.eyebrow} onChange={(value) => setHowItWorks((current) => ({ ...current, eyebrow: value }))} />
          <Field label="Title" value={howItWorks.title} onChange={(value) => setHowItWorks((current) => ({ ...current, title: value }))} />
          <Field label="Title Highlight" value={howItWorks.titleHighlight} onChange={(value) => setHowItWorks((current) => ({ ...current, titleHighlight: value }))} className="md:col-span-2" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {howItWorks.steps.map((step, index) => (
            <div key={step.num} className="rounded-xl border border-border/60 bg-background/60 p-4">
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

      <section className="rounded-2xl border border-border/60 bg-card/90 p-6 backdrop-blur">
        <h2 className="font-display text-2xl font-semibold text-foreground">About Us</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Eyebrow" value={about.eyebrow} onChange={(value) => setAbout((current) => ({ ...current, eyebrow: value }))} />
          <Field label="Title" value={about.title} onChange={(value) => setAbout((current) => ({ ...current, title: value }))} />
          <Field label="Title Highlight" value={about.titleHighlight} onChange={(value) => setAbout((current) => ({ ...current, titleHighlight: value }))} className="md:col-span-2" />
          <TextArea label="Description" value={about.description} onChange={(value) => setAbout((current) => ({ ...current, description: value }))} className="md:col-span-2" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {about.features.map((feature, index) => (
            <div key={index} className="rounded-xl border border-border/60 bg-background/60 p-4">
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
      className="w-full rounded border border-border bg-background px-3 py-2.5 font-body text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
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
      className="w-full rounded border border-border bg-background px-3 py-2.5 font-body text-sm text-foreground transition-colors focus:border-foreground focus:outline-none"
    />
  </div>
);

export default AdminContent;
