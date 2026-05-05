export const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:4000/api";

export class ApiError extends Error {
  status: number;
  issues?: unknown;

  constructor(message: string, status: number, issues?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.issues = issues;
  }
}

const formatIssues = (issues: unknown) => {
  if (!Array.isArray(issues)) {
    return null;
  }

  const messages = issues
    .map((issue) => {
      if (!issue || typeof issue !== "object") {
        return null;
      }

      const message =
        "message" in issue && typeof issue.message === "string" ? issue.message : null;
      const path =
        "path" in issue && Array.isArray(issue.path)
          ? issue.path.filter((segment) => typeof segment === "string" || typeof segment === "number").join(".")
          : "";

      if (!message) {
        return null;
      }

      return path ? `${path}: ${message}` : message;
    })
    .filter((message): message is string => !!message);

  return messages.length > 0 ? messages.join(" | ") : null;
};

type RequestOptions = RequestInit & {
  token?: string | null;
};

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { token, headers, body, ...rest } = options;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body,
  });

  if (!response.ok) {
    let payload: { message?: string; issues?: unknown } | null = null;
    try {
      payload = (await response.json()) as { message?: string; issues?: unknown };
    } catch {
      payload = null;
    }

    const issuesMessage = formatIssues(payload?.issues);
    throw new ApiError(
      issuesMessage
        ? `${payload?.message || "Request failed"}: ${issuesMessage}`
        : payload?.message || `Request failed with status ${response.status}`,
      response.status,
      payload?.issues,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};
