import { app } from "../../_app.js";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

const normalizeVerifyUrl = (url: string) => {
  const parsedUrl = new URL(url, "http://localhost");
  const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
  const referenceFromPath = pathSegments[pathSegments.length - 1] || "";
  const referenceFromQuery = parsedUrl.searchParams.get("reference")?.trim() || "";
  const reference = referenceFromPath || referenceFromQuery;

  parsedUrl.pathname = `/api/payments/verify/${reference}`;
  parsedUrl.searchParams.delete("reference");

  const normalizedUrl = `${parsedUrl.pathname}${parsedUrl.search}`;
  console.log("[vercel][payments-verify-route]", {
    method: "GET",
    originalUrl: url,
    reference,
    normalizedUrl,
  });

  return { normalizedUrl, reference };
};

export default (req: { url?: string; method?: string; originalUrl?: string }, res: unknown) => {
  const { normalizedUrl } = normalizeVerifyUrl(req.url ?? "/api/payments/verify");
  req.url = normalizedUrl;
  req.originalUrl = normalizedUrl;
  return app(req as never, res as never);
};
