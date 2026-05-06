import { z } from "zod";

const mediaTypeSchema = z.enum(["IMAGE", "VIDEO"]);

export const galleryCreateSchema = z.object({
  mediaType: mediaTypeSchema,
  mediaUrl: z.string().trim().url(),
  customerName: z.string().trim().max(120).optional().nullable().or(z.literal("")),
  caption: z.string().trim().max(1000).optional().nullable().or(z.literal("")),
  isPublished: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const galleryUpdateSchema = galleryCreateSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, "At least one field is required");

export const galleryQuerySchema = z.object({
  published: z
    .enum(["true", "false", "all"])
    .optional()
    .transform((value) => value ?? "true"),
  mediaType: mediaTypeSchema.optional(),
});
