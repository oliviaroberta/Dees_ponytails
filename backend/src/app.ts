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
  const allowedOrigins = new Set([
    env.FRONTEND_URL,
    "http://localhost:8080",
    "http://127.0.0.1:8080",
  ]);

  app.set("trust proxy", 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Origin not allowed by CORS"));
      },
    }),
  );
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
