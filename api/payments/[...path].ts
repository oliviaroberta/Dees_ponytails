import { app } from "../_app.js";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

const arraysEqual = (left: string[], right: string[]) =>
  left.length === right.length && left.every((value, index) => value === right[index]);

const isPrefix = (source: string[], prefix: string[]) =>
  prefix.length <= source.length && prefix.every((value, index) => source[index] === value);

const isSuffix = (source: string[], suffix: string[]) =>
  suffix.length <= source.length &&
  suffix.every((value, index) => source[source.length - suffix.length + index] === value);

const normalizePaymentUrl = (url: string) => {
  const parsedUrl = new URL(url, "http://localhost");
  const rawPathSegments = parsedUrl.searchParams.getAll("path").filter(Boolean);
  const currentSubpath = parsedUrl.pathname
    .split("/")
    .filter(Boolean)
    .slice(2);
  let normalizedSegments = currentSubpath;

  if (rawPathSegments.length > 0) {
    if (currentSubpath.length === 0) {
      normalizedSegments = rawPathSegments;
    } else if (arraysEqual(currentSubpath, rawPathSegments)) {
      normalizedSegments = currentSubpath;
    } else if (isPrefix(rawPathSegments, currentSubpath)) {
      normalizedSegments = rawPathSegments;
    } else if (isSuffix(currentSubpath, rawPathSegments)) {
      normalizedSegments = currentSubpath;
    } else {
      normalizedSegments = [...currentSubpath, ...rawPathSegments];
    }
  }

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
