import { Router } from "express";
import { SiteContent } from "../../models/index.js";
import { requireAdmin } from "../../middleware/require-admin.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { serializeSiteContent } from "../../utils/serializers.js";
import { defaultSiteContent } from "../../seed/default-data.js";
import { siteContentBodySchema } from "./site-content.schemas.js";

const siteContentRouter = Router();

siteContentRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    try {
      const [entry] = await SiteContent.findOrCreate({
        where: { key: "main" },
        defaults: {
          key: "main",
          content: defaultSiteContent,
        },
      });

      res.json({
        item: serializeSiteContent(entry),
      });
    } catch (error) {
      console.error("[site-content][get] request failed", {
        method: _req.method,
        url: _req.originalUrl,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
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
