import type { NextFunction, Request, Response } from "express";
import { Admin } from "../models/index.js";
import { verifyAccessToken } from "../utils/auth.js";
import { AppError } from "../utils/app-error.js";

declare module "express-serve-static-core" {
  interface Request {
    admin?: {
      id: string;
      email: string;
      role: "SUPER_ADMIN" | "STAFF";
    };
  }
}

export const requireAdmin = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }

    const token = authorization.slice("Bearer ".length).trim();
    const payload = verifyAccessToken(token);
    const admin = await Admin.findByPk(payload.adminId);

    if (!admin || !admin.isActive) {
      throw new AppError("Admin account is not available", 401);
    }

    req.admin = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};
