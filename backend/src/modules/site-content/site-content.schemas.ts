import { z } from "zod";

export const siteContentBodySchema = z.object({
  hero: z.object({
    eyebrow: z.string().trim().min(1),
    titleLine1: z.string().trim().min(1),
    titleHighlight: z.string().trim().min(1),
    description: z.string().trim().min(1),
    ctaLabel: z.string().trim().min(1),
  }),
  howItWorks: z.object({
    eyebrow: z.string().trim().min(1),
    title: z.string().trim().min(1),
    titleHighlight: z.string().trim().min(1),
    steps: z
      .array(
        z.object({
          num: z.string().trim().min(1),
          title: z.string().trim().min(1),
          text: z.string().trim().min(1),
        }),
      )
      .min(1),
  }),
  about: z.object({
    eyebrow: z.string().trim().min(1),
    title: z.string().trim().min(1),
    titleHighlight: z.string().trim().min(1),
    description: z.string().trim().min(1),
    features: z
      .array(
        z.object({
          title: z.string().trim().min(1),
          text: z.string().trim().min(1),
        }),
      )
      .min(1),
  }),
});
