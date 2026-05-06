export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface StoreReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  text: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}
