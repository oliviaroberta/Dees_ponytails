import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.js";

export const createApp = () => {
  const app = express();
  const normalizeOrigin = (value: string) => value.replace(/\/$/, "");
  const isProduction = env.NODE_ENV === "production";
  const allowedOrigins = new Set(
    [
      env.FRONTEND_URL,
      ...(isProduction ? [] : ["http://localhost:8080", "http://127.0.0.1:8080"]),
    ].map(normalizeOrigin),
  );
  const corsMiddleware = cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = normalizeOrigin(origin);

      if (allowedOrigins.has(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  app.set("trust proxy", 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(corsMiddleware);
  app.options("*", corsMiddleware);
  app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));
  app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "uploads"), {
      maxAge: "7d",
      immutable: true,
    }),
  );

  app.use("/api", apiRouter);

  app.use(errorHandler);

  return app;
};
