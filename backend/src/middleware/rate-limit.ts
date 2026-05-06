import type { Request, RequestHandler } from "express";
import { AppError } from "../utils/app-error.js";

type RateLimitOptions = {
  keyPrefix: string;
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
};

type Entry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Entry>();

const getClientIp = (req: Request) =>
  req.ip ||
  req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
  "unknown";

export const createRateLimit = ({
  keyPrefix,
  windowMs,
  max,
  message = "Too many requests. Please try again later.",
  keyGenerator,
}: RateLimitOptions): RequestHandler => {
  return (req, res, next) => {
    const now = Date.now();
    const key = `${keyPrefix}:${keyGenerator ? keyGenerator(req) : getClientIp(req)}`;
    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      buckets.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      next();
      return;
    }

    existing.count += 1;
    buckets.set(key, existing);

    if (existing.count > max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
      res.setHeader("Retry-After", retryAfterSeconds.toString());
      next(new AppError(message, 429));
      return;
    }

    next();
  };
};
