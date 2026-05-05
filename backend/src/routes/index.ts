import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { ordersRouter } from "../modules/orders/orders.routes.js";
import { paymentsRouter } from "../modules/payments/payments.routes.js";
import { productsRouter } from "../modules/products/products.routes.js";
import { reviewsRouter } from "../modules/reviews/reviews.routes.js";
import { salesRouter } from "../modules/sales/sales.routes.js";
import { siteContentRouter } from "../modules/site-content/site-content.routes.js";
import { uploadsRouter } from "../modules/uploads/uploads.routes.js";

const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "dees-ponytails-backend",
  });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/orders", ordersRouter);
apiRouter.use("/payments", paymentsRouter);
apiRouter.use("/sales", salesRouter);
apiRouter.use("/site-content", siteContentRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/uploads", uploadsRouter);

export { apiRouter };
