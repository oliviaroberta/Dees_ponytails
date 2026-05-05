import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "./AuthContext";

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
  isLoading: boolean;
  updateContent: (content: SiteContent) => Promise<void>;
  updateHero: (hero: HeroContent) => Promise<void>;
  updateHowItWorks: (howItWorks: SiteContent["howItWorks"]) => Promise<void>;
  updateAbout: (about: SiteContent["about"]) => Promise<void>;
  refreshContent: () => Promise<void>;
}

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

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);
let siteContentCache: SiteContent | null = null;
let siteContentRequest: Promise<SiteContent> | null = null;

const fetchSiteContent = async () => {
  if (siteContentCache) {
    return siteContentCache;
  }

  if (!siteContentRequest) {
    siteContentRequest = apiRequest<{ item: { content: SiteContent } }>("/site-content")
      .then((response) => {
        siteContentCache = response.item.content;
        return response.item.content;
      })
      .finally(() => {
        siteContentRequest = null;
      });
  }

  return siteContentRequest;
};

export const SiteContentProvider = ({ children }: { children: React.ReactNode }) => {
  const { accessToken } = useAuth();
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [isLoading, setIsLoading] = useState(true);

  const refreshContent = async () => {
    setIsLoading(true);
    try {
      siteContentCache = null;
      const nextContent = await fetchSiteContent();
      setContent(nextContent);
    } catch {
      setContent(defaultContent);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const nextContent = await fetchSiteContent();
        if (isMounted) {
          setContent(nextContent);
        }
      } catch {
        if (isMounted) {
          setContent(defaultContent);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveContent = async (nextContent: SiteContent) => {
    if (!accessToken) {
      throw new Error("Admin authentication is required");
    }

    const response = await apiRequest<{ item: { content: SiteContent } }>("/site-content", {
      method: "PUT",
      token: accessToken,
      body: JSON.stringify(nextContent),
    });

    siteContentCache = response.item.content;
    setContent(response.item.content);
  };

  const value = useMemo<SiteContentContextType>(
    () => ({
      content,
      isLoading,
      updateContent: saveContent,
      updateHero: async (hero) => {
        await saveContent({ ...content, hero });
      },
      updateHowItWorks: async (howItWorks) => {
        await saveContent({ ...content, howItWorks });
      },
      updateAbout: async (about) => {
        await saveContent({ ...content, about });
      },
      refreshContent,
    }),
    [accessToken, content, isLoading],
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
