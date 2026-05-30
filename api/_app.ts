import { createApp } from "../backend/src/app.js";

const app = createApp();

const arraysEqual = (left: string[], right: string[]) =>
  left.length === right.length && left.every((value, index) => value === right[index]);

const isPrefix = (source: string[], prefix: string[]) =>
  prefix.length <= source.length && prefix.every((value, index) => source[index] === value);

const isSuffix = (source: string[], suffix: string[]) =>
  suffix.length <= source.length &&
  suffix.every((value, index) => source[source.length - suffix.length + index] === value);

const normalizeVercelApiUrl = (url: string) => {
  const parsedUrl = new URL(url, "http://localhost");
  const rawPathSegments = parsedUrl.searchParams.getAll("path").filter(Boolean);
  const rawPath =
    rawPathSegments.length > 0 ? rawPathSegments.join("/") : parsedUrl.searchParams.get("path");

  if (!rawPath) {
    return url;
  }

  const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
  const normalizedSegments = rawPath
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (pathSegments[0] === "api") {
    const currentSubpath = pathSegments.slice(1);
    let nextSubpath = currentSubpath;

    if (currentSubpath.length === 0) {
      nextSubpath = normalizedSegments;
    } else if (arraysEqual(currentSubpath, normalizedSegments)) {
      nextSubpath = currentSubpath;
    } else if (isPrefix(normalizedSegments, currentSubpath)) {
      nextSubpath = normalizedSegments;
    } else if (isSuffix(currentSubpath, normalizedSegments)) {
      nextSubpath = currentSubpath;
    } else {
      nextSubpath = [...currentSubpath, ...normalizedSegments];
    }

    parsedUrl.pathname = `/${["api", ...nextSubpath].join("/")}`;
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
