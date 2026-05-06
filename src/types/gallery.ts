export interface GalleryItem {
  id: string;
  mediaType: "IMAGE" | "VIDEO";
  mediaUrl: string;
  customerName: string | null;
  caption: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
