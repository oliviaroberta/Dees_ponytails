import { Op } from "sequelize";
import { Product, SaleCampaign, SaleItem } from "../models/index.js";
import { AppError } from "./app-error.js";

export interface CheckoutItemInput {
  productId: string;
  quantity: number;
  color: string;
  length: string;
}

export interface PreparedCheckoutItem extends CheckoutItemInput {
  product: Product;
  unitPrice: number;
}

export const getActiveSalePriceMap = async (productIds: string[]) => {
  if (productIds.length === 0) {
    return new Map<string, number>();
  }

  const now = new Date();
  const activeCampaign = (await SaleCampaign.findOne({
    where: {
      isEnabled: true,
      [Op.and]: [
        {
          [Op.or]: [{ startsAt: null }, { startsAt: { [Op.lte]: now } }],
        },
        {
          [Op.or]: [{ endsAt: null }, { endsAt: { [Op.gte]: now } }],
        },
      ],
    },
    include: [
      {
        model: SaleItem,
        as: "items",
        where: {
          productId: {
            [Op.in]: productIds,
          },
        },
        required: false,
      },
    ],
    order: [["createdAt", "DESC"]],
  })) as (SaleCampaign & { items?: SaleItem[] }) | null;

  return new Map(
    (activeCampaign?.items ?? []).map((item) => [item.productId, Number(item.salePrice)]),
  );
};

export const prepareCheckoutItems = async (items: CheckoutItemInput[]): Promise<PreparedCheckoutItem[]> => {
  const products = await Product.findAll({
    where: {
      id: items.map((item) => item.productId),
    },
  });

  if (products.length !== items.length) {
    throw new AppError("One or more products were not found", 400);
  }

  const productsById = new Map(products.map((product) => [product.id, product]));
  const salePriceMap = await getActiveSalePriceMap(items.map((item) => item.productId));

  return items.map((item) => {
    const product = productsById.get(item.productId);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (product.status !== "IN_STOCK" || product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for ${product.name}`, 400);
    }

    return {
      ...item,
      product,
      unitPrice: Number(salePriceMap.get(product.id) ?? product.price),
    };
  });
};

export const calculateSubtotalAmount = (items: PreparedCheckoutItem[]) =>
  items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
