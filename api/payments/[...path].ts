import { app } from "../_app.js";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

const normalizePaymentUrl = (url: string) => {
  const parsedUrl = new URL(url, "http://localhost");
  const pathSegments = parsedUrl.searchParams.getAll("path").filter(Boolean);
  const normalizedSegments =
    pathSegments.length > 0
      ? pathSegments
      : parsedUrl.pathname
          .split("/")
          .filter(Boolean)
          .slice(2);

  parsedUrl.pathname = `/api/payments${normalizedSegments.length > 0 ? `/${normalizedSegments.join("/")}` : ""}`;
  parsedUrl.searchParams.delete("path");

  const normalizedUrl = `${parsedUrl.pathname}${parsedUrl.search}`;
  console.log("[vercel][payments-route]", {
    originalUrl: url,
    normalizedUrl,
  });

  return normalizedUrl;
};

export default (req: { url?: string }, res: unknown) => {
  req.url = normalizePaymentUrl(req.url ?? "/api/payments");
  return app(req as never, res as never);
};
