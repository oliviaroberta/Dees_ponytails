import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const logoutSchema = refreshSchema;

export const updateMeSchema = z.object({
  email: z.string().trim().email(),
  fullName: z.string().trim().min(2).max(120),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
});
