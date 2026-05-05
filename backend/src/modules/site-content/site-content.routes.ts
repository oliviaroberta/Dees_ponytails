import { Router } from "express";
import { SiteContent } from "../../models/index.js";
import { requireAdmin } from "../../middleware/require-admin.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { serializeSiteContent } from "../../utils/serializers.js";
import { siteContentBodySchema } from "./site-content.schemas.js";

const siteContentRouter = Router();

siteContentRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const entry = await SiteContent.findOne({ where: { key: "main" } });

    if (!entry) {
      return res.status(404).json({ message: "Site content not found" });
    }

    res.json({
      item: serializeSiteContent(entry),
    });
  }),
);

siteContentRouter.put(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = siteContentBodySchema.parse(req.body);

    const [entry] = await SiteContent.findOrCreate({
      where: { key: "main" },
      defaults: {
        key: "main",
        content: payload,
      },
    });

    await entry.update({ content: payload });

    res.json({
      message: "Site content updated successfully",
      item: serializeSiteContent(entry),
    });
  }),
);

export { siteContentRouter };
