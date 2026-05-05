import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface HeroContent {
  eyebrow: string;
  titleLine1: string;
  titleHighlight: string;
  description: string;
  ctaLabel: string;
}

export interface HowItWorksStepContent {
  num: string;
  title: string;
  text: string;
}

export interface AboutFeatureContent {
  title: string;
  text: string;
}

export interface SiteContent {
  hero: HeroContent;
  howItWorks: {
    eyebrow: string;
    title: string;
    titleHighlight: string;
    steps: HowItWorksStepContent[];
  };
  about: {
    eyebrow: string;
    title: string;
    titleHighlight: string;
    description: string;
    features: AboutFeatureContent[];
  };
}

interface SiteContentContextType {
  content: SiteContent;
  updateHero: (hero: HeroContent) => void;
  updateHowItWorks: (howItWorks: SiteContent["howItWorks"]) => void;
  updateAbout: (about: SiteContent["about"]) => void;
}

const STORAGE_KEY = "dees_site_content";

const defaultContent: SiteContent = {
  hero: {
    eyebrow: "Premium Ponytail Extensions",
    titleLine1: "Luxury Hair That Moves",
    titleHighlight: "With You",
    description:
      "Soft, reusable ponytail extensions designed for elegant everyday glam, birthdays, events, and effortless styling.",
    ctaLabel: "Shop Ponytails",
  },
  howItWorks: {
    eyebrow: "Simple Process",
    title: "How It",
    titleHighlight: "Works",
    steps: [
      {
        num: "01",
        title: "Browse",
        text: "Explore our collection and look through the ponytail styles, textures, and lengths available.",
      },
      {
        num: "02",
        title: "Choose",
        text: "Pick the ponytail you want and continue the order process directly on the website.",
      },
      {
        num: "03",
        title: "Pay via MoMo",
        text: "Make your payment securely on the website through Mobile Money.",
      },
    ],
  },
  about: {
    eyebrow: "About Us",
    title: "The",
    titleHighlight: "Dees_ponytails Promise",
    description:
      "We believe every woman deserves to feel confident and beautiful. Our ponytail extensions are sourced for quality, designed for comfort, and styled for impact so you can slay effortlessly, every single day.",
    features: [
      {
        title: "Premium Quality",
        text: "Handpicked, high-grade hair that looks and feels natural.",
      },
      {
        title: "Made with Love",
        text: "Each ponytail is carefully crafted for a flawless, secure fit.",
      },
      {
        title: "Trusted by 500+",
        text: "Loved by women across Ghana who trust Dees_ponytails for their glam.",
      },
    ],
  },
};

const normalizeContent = (saved: Partial<SiteContent> | null | undefined): SiteContent => ({
  hero: {
    ...defaultContent.hero,
    ...(saved?.hero ?? {}),
  },
  howItWorks: {
    ...defaultContent.howItWorks,
    ...(saved?.howItWorks ?? {}),
    steps: defaultContent.howItWorks.steps.map((step, index) => ({
      ...step,
      ...(saved?.howItWorks?.steps?.[index] ?? {}),
      num: step.num,
    })),
  },
  about: {
    ...defaultContent.about,
    ...(saved?.about ?? {}),
    features: defaultContent.about.features.map((feature, index) => ({
      ...feature,
      ...(saved?.about?.features?.[index] ?? {}),
    })),
  },
});

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

export const SiteContentProvider = ({ children }: { children: React.ReactNode }) => {
  const [content, setContent] = useState<SiteContent>(() => {
    if (typeof window === "undefined") return defaultContent;

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultContent;

    try {
      return normalizeContent(JSON.parse(saved) as Partial<SiteContent>);
    } catch {
      return defaultContent;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  }, [content]);

  const value = useMemo<SiteContentContextType>(
    () => ({
      content,
      updateHero: (hero) => setContent((current) => ({ ...current, hero })),
      updateHowItWorks: (howItWorks) => setContent((current) => ({ ...current, howItWorks })),
      updateAbout: (about) => setContent((current) => ({ ...current, about })),
    }),
    [content],
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
};

export const useSiteContent = () => {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error("useSiteContent must be used within SiteContentProvider");
  }

  return context;
};
