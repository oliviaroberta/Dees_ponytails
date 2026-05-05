import { z } from "zod";

export const saleItemSchema = z.object({
  productId: z.string().uuid(),
  salePrice: z.coerce.number().positive(),
});

export const saleCampaignBodySchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(5).max(2000),
  isEnabled: z.coerce.boolean().default(false),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  items: z.array(saleItemSchema).default([]),
});
