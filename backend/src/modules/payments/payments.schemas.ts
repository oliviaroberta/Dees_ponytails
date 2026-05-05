import { z } from "zod";
import { orderItemBodySchema } from "../orders/orders.schemas.js";

export const initializePaymentSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerPhone: z.string().trim().min(7).max(30),
  customerEmail: z.string().trim().email(),
  address: z.string().trim().min(3).max(500),
  city: z.string().trim().min(2).max(120),
  paymentMethod: z.enum(["MOMO", "CARD"]),
  notes: z.string().trim().max(2000).optional(),
  items: z.array(orderItemBodySchema).min(1),
});
