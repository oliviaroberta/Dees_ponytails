import { createExplicitApiHandler } from "../../_family-handler.js";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default createExplicitApiHandler({
  defaultUrl: "/api/payments/verify",
  label: "payments-verify-route",
  getTargetSegments: (_req, currentUrl) => {
    const pathSegments = currentUrl.pathname.split("/").filter(Boolean);
    const referenceFromPath = pathSegments[pathSegments.length - 1] || "";
    const referenceFromQuery = currentUrl.searchParams.get("reference")?.trim() || "";
    const reference = referenceFromPath || referenceFromQuery;

    currentUrl.searchParams.delete("reference");

    return ["payments", "verify", reference];
  },
});
