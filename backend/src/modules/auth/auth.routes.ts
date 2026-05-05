import { Router } from "express";
import { Op } from "sequelize";
import {
  changePasswordSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  updateMeSchema,
} from "./auth.schemas.js";
import { Admin, RefreshToken } from "../../models/index.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { AppError } from "../../utils/app-error.js";
import {
  comparePassword,
  hashPassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/auth.js";
import { requireAdmin } from "../../middleware/require-admin.js";

const authRouter = Router();

const buildAuthResponse = (admin: Admin) => {
  const payload = {
    adminId: admin.id,
    email: admin.email,
    role: admin.role,
  } as const;

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    admin: {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
    },
  };
};

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const payload = loginSchema.parse(req.body);
    const admin = await Admin.findOne({
      where: {
        email: {
          [Op.iLike]: payload.email,
        },
      },
    });

    if (!admin || !admin.isActive) {
      throw new AppError("Invalid email or password", 401);
    }

    const isValid = await comparePassword(payload.password, admin.passwordHash);

    if (!isValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const response = buildAuthResponse(admin);

    await RefreshToken.create({
      adminId: admin.id,
      token: response.refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      revokedAt: null,
    });

    res.json({
      ...response,
    });
  }),
);

authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken } = refreshSchema.parse(req.body);
    const storedToken = await RefreshToken.findOne({ where: { token: refreshToken } });

    if (!storedToken || storedToken.revokedAt) {
      throw new AppError("Refresh token is invalid", 401);
    }

    const payload = verifyRefreshToken(refreshToken);
    const admin = await Admin.findByPk(payload.adminId);

    if (!admin || !admin.isActive) {
      throw new AppError("Admin account is not available", 401);
    }

    storedToken.revokedAt = new Date();
    await storedToken.save();

    const response = buildAuthResponse(admin);

    await RefreshToken.create({
      adminId: admin.id,
      token: response.refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      revokedAt: null,
    });

    res.json(response);
  }),
);

authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const { refreshToken } = logoutSchema.parse(req.body);
    const storedToken = await RefreshToken.findOne({ where: { token: refreshToken } });

    if (storedToken && !storedToken.revokedAt) {
      storedToken.revokedAt = new Date();
      await storedToken.save();
    }

    res.json({ message: "Logged out successfully" });
  }),
);

authRouter.get(
  "/me",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const admin = await Admin.findByPk(req.admin!.id);

    if (!admin || !admin.isActive) {
      throw new AppError("Admin account is not available", 401);
    }

    res.json({
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
    });
  }),
);

authRouter.patch(
  "/me",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = updateMeSchema.parse(req.body);
    const admin = await Admin.findByPk(req.admin!.id);

    if (!admin || !admin.isActive) {
      throw new AppError("Admin account is not available", 401);
    }

    const existingAdmin = await Admin.findOne({
      where: {
        id: {
          [Op.ne]: admin.id,
        },
        email: {
          [Op.iLike]: payload.email,
        },
      },
    });

    if (existingAdmin) {
      throw new AppError("Another admin is already using that email", 409);
    }

    admin.email = payload.email;
    admin.fullName = payload.fullName;
    await admin.save();

    res.json({
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
      message: "Account updated successfully",
    });
  }),
);

authRouter.patch(
  "/change-password",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = changePasswordSchema.parse(req.body);
    const admin = await Admin.findByPk(req.admin!.id);

    if (!admin || !admin.isActive) {
      throw new AppError("Admin account is not available", 401);
    }

    const isValid = await comparePassword(payload.currentPassword, admin.passwordHash);

    if (!isValid) {
      throw new AppError("Current password is incorrect", 400);
    }

    const samePassword = await comparePassword(payload.newPassword, admin.passwordHash);

    if (samePassword) {
      throw new AppError("New password must be different from the current password", 400);
    }

    admin.passwordHash = await hashPassword(payload.newPassword);
    await admin.save();

    await RefreshToken.update(
      { revokedAt: new Date() },
      {
        where: {
          adminId: admin.id,
          revokedAt: null,
        },
      },
    );

    res.json({ message: "Password updated successfully. Please log in again." });
  }),
);

export { authRouter };
