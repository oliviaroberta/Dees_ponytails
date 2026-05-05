import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthTokenPayload {
  adminId: string;
  email: string;
  role: "SUPER_ADMIN" | "STAFF";
}

export const hashPassword = async (password: string) => bcrypt.hash(password, 12);

export const comparePassword = async (password: string, passwordHash: string) =>
  bcrypt.compare(password, passwordHash);

export const signAccessToken = (payload: AuthTokenPayload) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: "1h",
  });

export const signRefreshToken = (payload: AuthTokenPayload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthTokenPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as AuthTokenPayload;
