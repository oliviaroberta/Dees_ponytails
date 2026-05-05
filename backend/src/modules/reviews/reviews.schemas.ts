import { z } from "zod";

export const reviewQuerySchema = z.object({
  productId: z.string().uuid().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});

export const reviewBodySchema = z.object({
  productId: z.string().uuid(),
  customerName: z.string().trim().min(2).max(120),
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().trim().min(10).max(2000),
});

export const reviewStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});
