import { z } from "zod";

const productStatusSchema = z.enum(["IN_STOCK", "OUT_OF_STOCK"]);

export const productBodySchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must use lowercase letters, numbers, and hyphens only"),
  name: z.string().trim().min(2).max(120),
  image: z.string().trim().min(1),
  category: z.string().trim().min(2).max(80),
  textureStyle: z.string().trim().min(2).max(80),
  length: z.string().trim().min(1).max(120),
  color: z.string().trim().min(1).max(120),
  stock: z.coerce.number().int().min(0),
  price: z.coerce.number().positive(),
  description: z.string().trim().min(10).max(5000),
  featured: z.coerce.boolean().default(false),
  status: productStatusSchema.default("IN_STOCK"),
});

export const productUpdateSchema = productBodySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "At least one field is required",
);

export const productListQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  status: productStatusSchema.optional(),
  featured: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
