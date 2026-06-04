export const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ??
  "/api";
export const ADMIN_AUTH_STORAGE_KEY = "dees_admin_auth";

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

type CloudinarySignedUpload = {
  mode?: "signed";
  apiKey: string;
  cloudName: string;
  folder: string;
  publicId: string;
  resourceType: "image" | "video";
  signature: string;
  timestamp: number;
  uploadUrl: string;
};

type CloudinaryUnsignedUpload = {
  mode: "unsigned";
  cloudName: string;
  folder: string;
  publicId: string;
  resourceType: "image" | "video";
  uploadPreset: string;
  uploadUrl: string;
};

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { token, headers, body, ...rest } = options;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const storedToken =
    token ??
    (() => {
      if (typeof window === "undefined") {
        return null;
      }

      try {
        const raw = window.localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
        if (!raw) {
          return null;
        }

        const parsed = JSON.parse(raw) as { accessToken?: string | null };
        return parsed.accessToken ?? null;
      } catch {
        return null;
      }
    })();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
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

export const uploadCloudinaryMedia = async ({
  file,
  resourceType,
  token,
}: {
  file: File;
  resourceType: "image" | "video";
  token?: string | null;
}) => {
  const uploadConfig = await apiRequest<CloudinarySignedUpload | CloudinaryUnsignedUpload>(
    "/uploads/sign",
    {
      method: "POST",
      token,
      body: JSON.stringify({
        fileName: file.name,
        resourceType,
      }),
    },
  );

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", uploadConfig.folder);
  formData.append("public_id", uploadConfig.publicId);

  if (uploadConfig.mode === "unsigned") {
    formData.append("upload_preset", uploadConfig.uploadPreset);
  } else {
    formData.append("api_key", uploadConfig.apiKey);
    formData.append("timestamp", uploadConfig.timestamp.toString());
    formData.append("signature", uploadConfig.signature);
  }

  const response = await fetch(uploadConfig.uploadUrl, {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as
    | { secure_url?: string; error?: { message?: string } }
    | null;

  if (!response.ok || !payload?.secure_url) {
    throw new ApiError(
      payload?.error?.message || `${resourceType === "video" ? "Video" : "Image"} upload failed`,
      response.status,
    );
  }

  return payload.secure_url;
};
