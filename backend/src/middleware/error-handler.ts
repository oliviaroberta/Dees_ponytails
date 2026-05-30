import type { NextFunction, Request, Response } from "express";
import { ValidationError } from "sequelize";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error.js";

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof ZodError) {
    console.error("[api][validation-error]", {
      method: req.method,
      url: req.originalUrl,
      issues: error.issues,
    });
    return res.status(400).json({
      message: "Validation failed",
      issues: error.issues,
    });
  }

  if (error instanceof AppError) {
    console.error("[api][app-error]", {
      method: req.method,
      url: req.originalUrl,
      statusCode: error.statusCode,
      message: error.message,
    });
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  if (error instanceof ValidationError) {
    console.error("[api][sequelize-validation-error]", {
      method: req.method,
      url: req.originalUrl,
      message: error.message,
      issues: error.errors.map((issue) => ({
        message: issue.message,
        path: issue.path,
        value: issue.value,
      })),
    });
    return res.status(400).json({
      message: "Database validation failed",
      issues: error.errors.map((issue) => ({
        message: issue.message,
        path: issue.path,
        value: issue.value,
      })),
    });
  }

  if (
    error instanceof Error &&
    (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError")
  ) {
    console.error("[api][auth-token-error]", {
      method: req.method,
      url: req.originalUrl,
      message: error.message,
    });
    return res.status(401).json({
      message: "Authentication token is invalid or expired",
    });
  }

  if (error instanceof Error) {
    console.error("[api][unexpected-error]", {
      method: req.method,
      url: req.originalUrl,
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      message: error.message,
    });
  }

  console.error("[api][unknown-error]", {
    method: req.method,
    url: req.originalUrl,
    error,
  });
  return res.status(500).json({
    message: "Unknown server error",
  });
};
