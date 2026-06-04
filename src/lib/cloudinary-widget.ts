const CLOUDINARY_WIDGET_SCRIPT_SRC = "https://upload-widget.cloudinary.com/global/all.js";

let widgetScriptPromise: Promise<void> | null = null;

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim() || "";
const uploadPreset = import.meta.env.VITE_CLOUDINARY_VIDEO_UPLOAD_PRESET?.trim() || "";
const folder = import.meta.env.VITE_CLOUDINARY_UPLOAD_FOLDER?.trim() || "";

type CloudinaryUploadResult = {
  info?: {
    secure_url?: string;
  };
};

type CloudinaryWidgetInstance = {
  open: () => void;
};

type CloudinaryWidgetOptions = {
  cloudName: string;
  uploadPreset: string;
  folder?: string;
  multiple?: boolean;
  maxFiles?: number;
  resourceType?: "image" | "video";
  sources?: string[];
  clientAllowedFormats?: string[];
};

type CloudinaryGlobal = {
  createUploadWidget: (
    options: CloudinaryWidgetOptions,
    callback: (error: { message?: string } | null, result: CloudinaryUploadResult & { event?: string }) => void,
  ) => CloudinaryWidgetInstance;
};

declare global {
  interface Window {
    cloudinary?: CloudinaryGlobal;
  }

  interface ImportMetaEnv {
    readonly VITE_CLOUDINARY_CLOUD_NAME?: string;
    readonly VITE_CLOUDINARY_VIDEO_UPLOAD_PRESET?: string;
    readonly VITE_CLOUDINARY_UPLOAD_FOLDER?: string;
  }
}

export const isCloudinaryVideoWidgetConfigured = () => !!cloudName && !!uploadPreset;

export const isValidCloudinaryVideoUrl = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" && parsed.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
};

const loadCloudinaryWidgetScript = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Cloudinary widget is only available in the browser"));
  }

  if (window.cloudinary) {
    return Promise.resolve();
  }

  if (!widgetScriptPromise) {
    widgetScriptPromise = new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(
        `script[src="${CLOUDINARY_WIDGET_SCRIPT_SRC}"]`,
      );

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener("error", () => reject(new Error("Failed to load Cloudinary widget")), {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.src = CLOUDINARY_WIDGET_SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Cloudinary widget"));
      document.body.appendChild(script);
    }).then(() => {
      if (!window.cloudinary) {
        throw new Error("Cloudinary widget did not initialize");
      }
    });
  }

  return widgetScriptPromise;
};

export const openCloudinaryVideoWidget = async () => {
  if (!isCloudinaryVideoWidgetConfigured()) {
    throw new Error("Cloudinary video widget is not configured");
  }

  await loadCloudinaryWidgetScript();

  return new Promise<string>((resolve, reject) => {
    let settled = false;
    const widget = window.cloudinary?.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        folder: folder || undefined,
        multiple: false,
        maxFiles: 1,
        resourceType: "video",
        sources: ["local", "url", "camera"],
        clientAllowedFormats: ["mp4", "mov", "webm", "m4v", "avi", "mkv"],
      },
      (error, result) => {
        if (error) {
          settled = true;
          reject(new Error(error.message || "Video upload failed"));
          return;
        }

        if (result.event === "success" && result.info?.secure_url) {
          settled = true;
          resolve(result.info.secure_url);
          return;
        }

        if (result.event === "close" && !settled) {
          settled = true;
          reject(new Error("Video upload was cancelled"));
        }
      },
    );

    if (!widget) {
      reject(new Error("Cloudinary widget could not be created"));
      return;
    }

    widget.open();
  });
};
