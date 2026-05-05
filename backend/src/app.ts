import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { apiRouter } from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.js";

export const createApp = () => {
  const app = express();

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(cors());
  app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
  app.use(express.json());
  app.use(morgan("dev"));
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  app.use("/api", apiRouter);

  app.use(errorHandler);

  return app;
};
