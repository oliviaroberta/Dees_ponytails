import { Router } from "express";
import { Op } from "sequelize";
import { Order, OrderItem, Product } from "../../models/index.js";
import { requireAdmin } from "../../middleware/require-admin.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { AppError } from "../../utils/app-error.js";
import { serializeOrder } from "../../utils/serializers.js";
import { orderBodySchema, orderQuerySchema, orderStatusSchema } from "./orders.schemas.js";
import { sequelize } from "../../lib/sequelize.js";
import { calculateSubtotalAmount, prepareCheckoutItems } from "../../utils/pricing.js";

const ordersRouter = Router();

const getRouteParam = (value: string | string[]) => (Array.isArray(value) ? value[0] : value);

const generateReference = () => `DP-${Date.now().toString(36).toUpperCase()}`;

ordersRouter.get(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const query = orderQuerySchema.parse(req.query);
    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.paymentStatus) {
      where.paymentStatus = query.paymentStatus;
    }

    const orders = await Order.findAll({
      where,
      include: [{ model: OrderItem, as: "items" }],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      items: orders.map((order) => serializeOrder(order)),
      count: orders.length,
    });
  }),
);

ordersRouter.get(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = getRouteParam(req.params.id);
    const order = await Order.findOne({
      where: {
        [Op.or]: [{ id }, { reference: id }],
      },
      include: [{ model: OrderItem, as: "items" }],
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    res.json({
      item: serializeOrder(order),
    });
  }),
);

ordersRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = orderBodySchema.parse(req.body);
    const sanitizedItems = await prepareCheckoutItems(payload.items);
    const subtotalAmount = calculateSubtotalAmount(sanitizedItems);

    const result = await sequelize.transaction(async (transaction) => {
      const order = await Order.create(
        {
          reference: generateReference(),
          customerName: payload.customerName,
          customerPhone: payload.customerPhone,
          customerEmail: payload.customerEmail || null,
          address: payload.address,
          city: payload.city,
          paymentMethod: payload.paymentMethod,
          paymentStatus: "PENDING",
          status: "PENDING",
          subtotalAmount,
          totalAmount: subtotalAmount,
          notes: payload.notes || null,
        },
        { transaction },
      );

      await OrderItem.bulkCreate(
        sanitizedItems.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          color: item.color,
          length: item.length,
        })),
        { transaction },
      );

      for (const item of sanitizedItems) {
        const remainingStock = item.product.stock - item.quantity;
        await item.product.update(
          {
            stock: remainingStock,
            status: remainingStock > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
          },
          { transaction },
        );
      }

      return Order.findByPk(order.id, {
        include: [{ model: OrderItem, as: "items" }],
        transaction,
      });
    });

    if (!result) {
      throw new AppError("Order could not be created", 500);
    }

    res.status(201).json({
      message: "Order created successfully",
      item: serializeOrder(result),
    });
  }),
);

ordersRouter.patch(
  "/:id/status",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = getRouteParam(req.params.id);
    const payload = orderStatusSchema.parse(req.body);
    const order = await Order.findOne({
      where: {
        [Op.or]: [{ id }, { reference: id }],
      },
      include: [{ model: OrderItem, as: "items" }],
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    await order.update({
      status: payload.status ?? order.status,
      paymentStatus: payload.paymentStatus ?? order.paymentStatus,
    });

    res.json({
      message: "Order status updated successfully",
      item: serializeOrder(order),
    });
  }),
);

export { ordersRouter };
