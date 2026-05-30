import { createApp } from "../backend/src/app.js";

const app = createApp();

const normalizeVercelApiUrl = (url: string) => {
  const parsedUrl = new URL(url, "http://localhost");
  const rawPathSegments = parsedUrl.searchParams.getAll("path").filter(Boolean);
  const rawPath =
    rawPathSegments.length > 0 ? rawPathSegments.join("/") : parsedUrl.searchParams.get("path");

  if (!rawPath) {
    return url;
  }

  const normalizedPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;

  if (parsedUrl.pathname === "/api" || parsedUrl.pathname === "/api/") {
    parsedUrl.pathname = `/api${normalizedPath}`;
  }

  parsedUrl.searchParams.delete("path");
  return `${parsedUrl.pathname}${parsedUrl.search}`;
};

export const handler = (req: { url?: string }, res: unknown) => {
  if (req.url) {
    req.url = normalizeVercelApiUrl(req.url);
  }

  return app(req as never, res as never);
};

export { app };
