import { createExplicitApiHandler } from "../../_family-handler.js";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default createExplicitApiHandler({
  defaultUrl: "/api/orders/status",
  label: "orders-status-route",
  getTargetSegments: (_req, currentUrl) => {
    const pathSegments = currentUrl.pathname.split("/").filter(Boolean);
    const idFromPath = pathSegments[pathSegments.length - 2] || "";
    const idFromQuery = currentUrl.searchParams.get("id")?.trim() || "";
    const id = idFromPath || idFromQuery;

    currentUrl.searchParams.delete("id");

    console.log("[vercel][orders-status-route-id]", {
      id,
    });

    return ["orders", id, "status"];
  },
});
