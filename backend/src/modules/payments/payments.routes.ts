import crypto from "node:crypto";
import { Router } from "express";
import { Order, OrderItem } from "../../models/index.js";
import { env } from "../../config/env.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { AppError } from "../../utils/app-error.js";
import { serializeOrder } from "../../utils/serializers.js";
import { calculateSubtotalAmount, prepareCheckoutItems } from "../../utils/pricing.js";
import { initializePaymentSchema } from "./payments.schemas.js";
import { sequelize } from "../../lib/sequelize.js";
import { syncOrderStockForTransition } from "../../utils/order-stock.js";
import { getDeliveryTimelineForCity } from "../../utils/delivery.js";

const paymentsRouter = Router();

const PAYSTACK_BASE_URL = "https://api.paystack.co";

const generateReference = () => `DP-${Date.now().toString(36).toUpperCase()}`;

const getPaystackSecretKey = () => {
  if (!env.PAYSTACK_SECRET_KEY) {
    throw new AppError("Paystack is not configured on the backend yet", 503);
  }

  return env.PAYSTACK_SECRET_KEY;
};

const paystackRequest = async <T>(path: string, options: RequestInit = {}) => {
  const secretKey = getPaystackSecretKey();
  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const payload = (await response.json()) as {
    status: boolean;
    message: string;
    data?: T;
  };

  if (!response.ok || !payload.status) {
    throw new AppError(payload.message || "Paystack request failed", 502);
  }

  return payload.data as T;
};

const finalizePaidOrder = async (reference: string) => {
  return sequelize.transaction(async (transaction) => {
    const order = await Order.findOne({
      where: { reference },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.paymentStatus === "SUCCESS") {
      const settledOrder = await Order.findByPk(order.id, {
        include: [{ model: OrderItem, as: "items" }],
        transaction,
      });

      if (!settledOrder) {
        throw new AppError("Order not found", 404);
      }

      return settledOrder;
    }

    const orderWithItems = (await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: "items" }],
      transaction,
    })) as (Order & { items?: OrderItem[] }) | null;

    if (!orderWithItems) {
      throw new AppError("Order not found", 404);
    }

    await syncOrderStockForTransition(
      orderWithItems,
      {
        status: "PAID",
        paymentStatus: "SUCCESS",
      },
      transaction,
    );

    await order.update(
      {
        paymentStatus: "SUCCESS",
        status: "PAID",
      },
      { transaction },
    );

    const finalizedOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: "items" }],
      transaction,
    });

    if (!finalizedOrder) {
      throw new AppError("Order not found", 404);
    }

    return finalizedOrder;
  });
};

paymentsRouter.post(
  "/initialize",
  asyncHandler(async (req, res) => {
    const payload = initializePaymentSchema.parse(req.body);
    const preparedItems = await prepareCheckoutItems(payload.items);
    const subtotalAmount = calculateSubtotalAmount(preparedItems);
    const reference = generateReference();

    const order = await Order.create({
      reference,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      customerEmail: payload.customerEmail,
      address: payload.address,
      city: payload.city,
      paymentMethod: payload.paymentMethod,
      paymentStatus: "PENDING",
      deliveryTimeline: getDeliveryTimelineForCity(payload.city),
      deliveryStatus: "PENDING",
      status: "PENDING",
      subtotalAmount,
      totalAmount: subtotalAmount,
      notes: payload.notes || null,
    });

    await OrderItem.bulkCreate(
      preparedItems.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        color: item.color,
        length: item.length,
      })),
    );

    try {
      const data = await paystackRequest<{
        authorization_url: string;
        access_code: string;
        reference: string;
      }>("/transaction/initialize", {
        method: "POST",
        body: JSON.stringify({
          email: payload.customerEmail,
          amount: Math.round(subtotalAmount * 100),
          currency: "GHS",
          reference,
          callback_url: `${env.FRONTEND_URL}/checkout/callback?reference=${reference}`,
          channels: payload.paymentMethod === "MOMO" ? ["mobile_money"] : ["card"],
          metadata: {
            orderReference: reference,
            customerPhone: payload.customerPhone,
            paymentMethod: payload.paymentMethod,
          },
        }),
      });

      res.status(201).json({
        message: "Payment initialized successfully",
        item: {
          order: serializeOrder(order),
          authorizationUrl: data.authorization_url,
          accessCode: data.access_code,
          reference: data.reference,
        },
      });
    } catch (error) {
      await order.update({
        paymentStatus: "FAILED",
      });

      throw error;
    }
  }),
);

paymentsRouter.get(
  "/verify/:reference",
  asyncHandler(async (req, res) => {
    const reference = Array.isArray(req.params.reference)
      ? req.params.reference[0]
      : req.params.reference;

    const order = await Order.findOne({
      where: { reference },
      include: [{ model: OrderItem, as: "items" }],
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    const data = await paystackRequest<{
      status: string;
      reference: string;
      amount: number;
      gateway_response: string;
    }>(`/transaction/verify/${reference}`);

    const expectedAmount = Math.round(Number(order.totalAmount) * 100);

    if (data.amount !== expectedAmount) {
      throw new AppError("Payment amount mismatch", 400);
    }

    if (data.status !== "success") {
      await order.update({
        paymentStatus: "FAILED",
      });

      return res.json({
        verified: false,
        message: data.gateway_response || "Payment was not successful",
        item: serializeOrder(order),
      });
    }

    const settledOrder = await finalizePaidOrder(reference);

    res.json({
      verified: true,
      message: "Payment verified successfully",
      item: serializeOrder(settledOrder),
    });
  }),
);

paymentsRouter.post(
  "/webhook",
  asyncHandler(async (req, res) => {
    const signature = req.headers["x-paystack-signature"];
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
    const secretKey = getPaystackSecretKey();
    const expectedSignature = crypto
      .createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex");

    if (typeof signature !== "string" || signature !== expectedSignature) {
      throw new AppError("Invalid webhook signature", 401);
    }

    const event = JSON.parse(rawBody.toString("utf8")) as {
      event: string;
      data?: {
        reference?: string;
        status?: string;
      };
    };

    if (event.event === "charge.success" && event.data?.reference && event.data.status === "success") {
      await finalizePaidOrder(event.data.reference);
    }

    res.json({ received: true });
  }),
);

export { paymentsRouter };
