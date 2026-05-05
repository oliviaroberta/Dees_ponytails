import { Router } from "express";
import { Product, SaleCampaign, SaleItem } from "../../models/index.js";
import { requireAdmin } from "../../middleware/require-admin.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { AppError } from "../../utils/app-error.js";
import { serializeSaleCampaign } from "../../utils/serializers.js";
import { saleCampaignBodySchema } from "./sales.schemas.js";
import { sequelize } from "../../lib/sequelize.js";

const salesRouter = Router();

const saleIncludes = [
  {
    model: SaleItem,
    as: "items",
    include: [
      {
        model: Product,
        as: "product",
      },
    ],
  },
];

salesRouter.get(
  "/active",
  asyncHandler(async (_req, res) => {
    const activeSale = await SaleCampaign.findOne({
      where: { isEnabled: true },
      include: saleIncludes,
      order: [["createdAt", "DESC"]],
    });

    if (!activeSale) {
      return res.status(404).json({ message: "No active sale campaign found" });
    }

    res.json({
      item: serializeSaleCampaign(activeSale),
    });
  }),
);

salesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const campaigns = await SaleCampaign.findAll({
      include: saleIncludes,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      items: campaigns.map(serializeSaleCampaign),
      count: campaigns.length,
    });
  }),
);

salesRouter.post(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = saleCampaignBodySchema.parse(req.body);

    const products = await Product.findAll({
      where: {
        id: payload.items.map((item) => item.productId),
      },
    });

    if (products.length !== payload.items.length) {
      throw new AppError("One or more sale products were not found", 400);
    }

    const result = await sequelize.transaction(async (transaction) => {
      const existing = await SaleCampaign.findOne({
        where: { isEnabled: true },
        include: saleIncludes,
        order: [["createdAt", "DESC"]],
        transaction,
      });

      const campaign =
        existing ??
        (await SaleCampaign.create(
          {
            title: payload.title,
            description: payload.description,
            isEnabled: payload.isEnabled,
            startsAt: payload.startsAt ? new Date(payload.startsAt) : null,
            endsAt: payload.endsAt ? new Date(payload.endsAt) : null,
          },
          { transaction },
        ));

      await campaign.update(
        {
          title: payload.title,
          description: payload.description,
          isEnabled: payload.isEnabled,
          startsAt: payload.startsAt ? new Date(payload.startsAt) : null,
          endsAt: payload.endsAt ? new Date(payload.endsAt) : null,
        },
        { transaction },
      );

      await SaleItem.destroy({
        where: { saleCampaignId: campaign.id },
        transaction,
      });

      if (payload.items.length > 0) {
        await SaleItem.bulkCreate(
          payload.items.map((item) => ({
            saleCampaignId: campaign.id,
            productId: item.productId,
            salePrice: item.salePrice,
          })),
          { transaction },
        );
      }

      return SaleCampaign.findByPk(campaign.id, {
        include: saleIncludes,
        transaction,
      });
    });

    if (!result) {
      throw new AppError("Sale campaign could not be saved", 500);
    }

    res.json({
      message: "Sale campaign saved successfully",
      item: serializeSaleCampaign(result),
    });
  }),
);

export { salesRouter };
