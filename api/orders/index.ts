import { createExplicitApiHandler } from "../_family-handler.js";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default createExplicitApiHandler({
  defaultUrl: "/api/orders",
  label: "orders-index-route",
  getTargetSegments: () => ["orders"],
});
