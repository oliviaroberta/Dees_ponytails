import type { NextFunction, Request, Response } from "express";
import { ValidationError } from "sequelize";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error.js";

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      issues: error.issues,
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  if (error instanceof ValidationError) {
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
    return res.status(401).json({
      message: "Authentication token is invalid or expired",
    });
  }

  if (error instanceof Error) {
    return res.status(500).json({
      message: error.message,
    });
  }

  return res.status(500).json({
    message: "Unknown server error",
  });
};
