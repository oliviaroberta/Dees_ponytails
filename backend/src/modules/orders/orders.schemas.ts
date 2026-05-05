import { z } from "zod";

export const orderQuerySchema = z.object({
  status: z.enum(["PENDING", "PAID", "PROCESSING", "DELIVERED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["PENDING", "SUCCESS", "FAILED"]).optional(),
});

export const orderItemBodySchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1),
  color: z.string().trim().min(1),
  length: z.string().trim().min(1),
});

export const orderBodySchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerPhone: z.string().trim().min(7).max(30),
  customerEmail: z.string().trim().email().optional().or(z.literal("")),
  address: z.string().trim().min(3).max(500),
  city: z.string().trim().min(2).max(120),
  paymentMethod: z.enum(["MOMO", "CARD"]),
  notes: z.string().trim().max(2000).optional(),
  items: z.array(orderItemBodySchema).min(1),
});

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "PROCESSING", "DELIVERED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["PENDING", "SUCCESS", "FAILED"]).optional(),
}).refine((value) => value.status || value.paymentStatus, "Status or paymentStatus is required");
