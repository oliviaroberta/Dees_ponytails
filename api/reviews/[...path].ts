import { createApiFamilyHandler } from "../_family-handler.js";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default createApiFamilyHandler({
  defaultUrl: "/api/reviews",
  familySegments: ["reviews"],
  label: "reviews-route",
});
