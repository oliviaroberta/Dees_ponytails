import { createApiFamilyHandler } from "../_family-handler.js";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default createApiFamilyHandler({
  defaultUrl: "/api/gallery",
  familySegments: ["gallery"],
  label: "gallery-route",
});
