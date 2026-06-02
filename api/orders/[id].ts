import { createExplicitApiHandler } from "../_family-handler.js";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default createExplicitApiHandler({
  defaultUrl: "/api/orders",
  label: "orders-detail-route",
  getTargetSegments: (_req, currentUrl) => {
    const pathSegments = currentUrl.pathname.split("/").filter(Boolean);
    const idFromPath = pathSegments[pathSegments.length - 1] || "";
    const idFromQuery = currentUrl.searchParams.get("id")?.trim() || "";
    const id = idFromPath || idFromQuery;

    currentUrl.searchParams.delete("id");

    return ["orders", id];
  },
});
