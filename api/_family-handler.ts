import { app } from "./_app.js";

type MutableRequest = {
  method?: string;
  originalUrl?: string;
  url?: string;
};

type HandlerOptions = {
  defaultUrl: string;
  familySegments?: string[];
  label: string;
};

type ExplicitHandlerOptions = {
  defaultUrl: string;
  getTargetSegments: (req: MutableRequest, currentUrl: URL) => string[];
  label: string;
};

const splitSegments = (value: string) =>
  value
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);

const arraysEqual = (left: string[], right: string[]) =>
  left.length === right.length && left.every((value, index) => value === right[index]);

const isPrefix = (source: string[], prefix: string[]) =>
  prefix.length <= source.length && prefix.every((value, index) => source[index] === value);

const extractPathQuerySegments = (parsedUrl: URL) => {
  const repeatedSegments = parsedUrl.searchParams
    .getAll("path")
    .flatMap(splitSegments);

  if (repeatedSegments.length > 0) {
    return repeatedSegments;
  }

  const singleValue = parsedUrl.searchParams.get("path");
  return singleValue ? splitSegments(singleValue) : [];
};

const mergeSegments = (currentSegments: string[], querySegments: string[]) => {
  if (querySegments.length === 0) {
    return currentSegments;
  }

  if (currentSegments.length === 0) {
    return querySegments;
  }

  if (arraysEqual(currentSegments, querySegments)) {
    return currentSegments;
  }

  if (isPrefix(querySegments, currentSegments)) {
    return querySegments;
  }

  if (isPrefix(currentSegments, querySegments)) {
    return currentSegments;
  }

  return [...currentSegments, ...querySegments];
};

const buildNormalizedUrl = (parsedUrl: URL, targetSegments: string[]) => {
  parsedUrl.pathname = `/api${targetSegments.length > 0 ? `/${targetSegments.join("/")}` : ""}`;
  parsedUrl.searchParams.delete("path");
  return `${parsedUrl.pathname}${parsedUrl.search}`;
};

export const createApiFamilyHandler = ({
  defaultUrl,
  familySegments = [],
  label,
}: HandlerOptions) => {
  return (req: MutableRequest, res: unknown) => {
    const originalUrl = req.url ?? defaultUrl;
    const parsedUrl = new URL(originalUrl, "http://localhost");
    const currentSegments = splitSegments(parsedUrl.pathname)
      .slice(1)
      .filter((segment, index) => familySegments[index] === segment)
      .length === familySegments.length
      ? splitSegments(parsedUrl.pathname).slice(1 + familySegments.length)
      : splitSegments(parsedUrl.pathname).slice(1);
    const querySegments = extractPathQuerySegments(parsedUrl);
    const targetSegments = [...familySegments, ...mergeSegments(currentSegments, querySegments)];
    const normalizedUrl = buildNormalizedUrl(parsedUrl, targetSegments);

    console.log(`[vercel][${label}]`, {
      method: req.method,
      originalUrl,
      normalizedUrl,
    });

    req.url = normalizedUrl;
    req.originalUrl = normalizedUrl;
    return app(req as never, res as never);
  };
};

export const createExplicitApiHandler = ({
  defaultUrl,
  getTargetSegments,
  label,
}: ExplicitHandlerOptions) => {
  return (req: MutableRequest, res: unknown) => {
    const originalUrl = req.url ?? defaultUrl;
    const parsedUrl = new URL(originalUrl, "http://localhost");
    const targetSegments = getTargetSegments(req, parsedUrl);
    const normalizedUrl = buildNormalizedUrl(parsedUrl, targetSegments);

    console.log(`[vercel][${label}]`, {
      method: req.method,
      originalUrl,
      normalizedUrl,
    });

    req.url = normalizedUrl;
    req.originalUrl = normalizedUrl;
    return app(req as never, res as never);
  };
};
