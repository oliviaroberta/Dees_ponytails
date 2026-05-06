import type { Transaction } from "sequelize";
import { Order, OrderItem, Product } from "../models/index.js";
import { AppError } from "./app-error.js";

type StockManagedOrder = Order & { items?: OrderItem[] };

interface OrderStockState {
  status: Order["status"];
  paymentStatus: Order["paymentStatus"];
}

const resolveOrderItems = async (order: StockManagedOrder, transaction: Transaction) => {
  if (order.items) {
    return order.items;
  }

  return OrderItem.findAll({
    where: { orderId: order.id },
    transaction,
  });
};

const updateProductStock = async (
  productId: string,
  quantityDelta: number,
  transaction: Transaction,
) => {
  const product = await Product.findByPk(productId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!product) {
    throw new AppError("Product not found while updating stock", 404);
  }

  const nextStock = product.stock + quantityDelta;

  if (nextStock < 0) {
    throw new AppError(`Insufficient stock for ${product.name}`, 400);
  }

  await product.update(
    {
      stock: nextStock,
      status: nextStock > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
    },
    { transaction },
  );
};

export const doesOrderCommitStock = ({ status, paymentStatus }: OrderStockState) =>
  paymentStatus === "SUCCESS" && status !== "CANCELLED";

export const syncOrderStockForTransition = async (
  order: StockManagedOrder,
  nextState: OrderStockState,
  transaction: Transaction,
) => {
  const currentlyCommitted = doesOrderCommitStock(order);
  const shouldBeCommitted = doesOrderCommitStock(nextState);

  if (currentlyCommitted === shouldBeCommitted) {
    return;
  }

  const items = await resolveOrderItems(order, transaction);
  const quantityDelta = shouldBeCommitted ? -1 : 1;

  for (const item of items) {
    await updateProductStock(item.productId, item.quantity * quantityDelta, transaction);
  }
};
