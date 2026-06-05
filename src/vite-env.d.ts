/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUDINARY_CLOUD_NAME?: string;
  readonly VITE_CLOUDINARY_UNSIGNED_UPLOAD_PRESET?: string;
  readonly VITE_CLOUDINARY_VIDEO_UPLOAD_PRESET?: string;
  readonly VITE_CLOUDINARY_UPLOAD_FOLDER?: string;
}

declare module "*.PNG" {
  const src: string;
  export default src;
}
