export type OrderStatus = "PENDING" | "PAID" | "PROCESSING" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";
export type DeliveryStatus = "PENDING" | "SCHEDULED" | "OUT_FOR_DELIVERY" | "DELIVERED";
export type DeliveryTimeline = "SAME_DAY" | "NEXT_DAY";

export interface AdminOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  color: string;
  length: string;
}

export interface AdminOrder {
  id: string;
  reference: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  address: string;
  city: string;
  status: OrderStatus;
  paymentMethod: "MOMO" | "CARD";
  paymentStatus: PaymentStatus;
  deliveryTimeline: DeliveryTimeline;
  deliveryStatus: DeliveryStatus;
  subtotalAmount: number;
  totalAmount: number;
  notes: string | null;
  items: AdminOrderItem[];
  createdAt: string;
}
