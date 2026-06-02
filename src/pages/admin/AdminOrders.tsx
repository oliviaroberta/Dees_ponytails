import { useEffect, useMemo, useState } from "react";
import { Eye, MessageCircle, PackageCheck } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { useCurrency } from "@/context/CurrencyContext";
import type { AdminOrder, DeliveryStatus, OrderStatus, PaymentStatus } from "@/types/order";
import PaginationControls from "@/components/PaginationControls";

const ORDERS_PER_PAGE = 5;
type OrderFilter = "ALL" | OrderStatus;

const formatOrderDate = (value: string) =>
  new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDeliveryTimeline = (timeline: AdminOrder["deliveryTimeline"]) =>
  timeline === "SAME_DAY" ? "Same-day delivery" : "Next-day delivery";

const formatDeliveryStatus = (status: DeliveryStatus) => status.replaceAll("_", " ");

const getWhatsAppHref = (order: AdminOrder) => {
  const normalizedPhone = order.customerPhone.replace(/[^\d]/g, "");
  const message = encodeURIComponent(
    `Hello ${order.customerName}, this is Dees Ponytails regarding your order ${order.reference}.`,
  );

  return `https://wa.me/${normalizedPhone}?text=${message}`;
};

const getRevenueEligibleAmount = (order: AdminOrder) =>
  order.paymentStatus === "SUCCESS" && order.status !== "CANCELLED" ? order.totalAmount : 0;

const normalizeStatusUpdate = (
  order: AdminOrder,
  updates: {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    deliveryStatus?: DeliveryStatus;
  },
) => {
  let nextStatus = updates.status ?? order.status;
  const nextPaymentStatus = updates.paymentStatus ?? order.paymentStatus;
  const nextDeliveryStatus = updates.deliveryStatus ?? order.deliveryStatus;

  if (nextDeliveryStatus === "DELIVERED") {
    nextStatus = "DELIVERED";
  } else if (
    nextPaymentStatus === "SUCCESS" &&
    nextStatus === "PENDING"
  ) {
    nextStatus = "PROCESSING";
  }

  return {
    status: nextStatus,
    paymentStatus: nextPaymentStatus,
    deliveryStatus: nextDeliveryStatus,
  };
};

const getOrderStatusOptions = (paymentStatus: PaymentStatus, deliveryStatus: DeliveryStatus) => {
  const options: OrderStatus[] = ["PENDING", "PAID", "PROCESSING", "DELIVERED", "CANCELLED"];

  if (paymentStatus !== "SUCCESS") {
    return options.filter((status) => status !== "PROCESSING");
  }

  if (deliveryStatus === "DELIVERED") {
    return ["DELIVERED", "CANCELLED"];
  }

  return options;
};

const AdminOrders = () => {
  const { accessToken } = useAuth();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderFilter>("ALL");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadOrders = async () => {
    if (!accessToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest<{ items: AdminOrder[] }>("/orders", {
        token: accessToken,
      });
      setOrders(response.items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, [accessToken]);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  const filteredOrders = useMemo(
    () =>
      statusFilter === "ALL"
        ? orders
        : orders.filter((order) => order.status === statusFilter),
    [orders, statusFilter],
  );

  const summary = useMemo(
    () => ({
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + getRevenueEligibleAmount(order), 0),
      pendingOrders: orders.filter((order) => order.status === "PENDING").length,
      paidOrders: orders.filter((order) => order.paymentStatus === "SUCCESS").length,
      deliveredOrders: orders.filter((order) => order.deliveryStatus === "DELIVERED").length,
    }),
    [orders],
  );

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const paginatedOrders = useMemo(
    () =>
      filteredOrders.slice(
        (currentPage - 1) * ORDERS_PER_PAGE,
        currentPage * ORDERS_PER_PAGE,
      ),
    [currentPage, filteredOrders],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const updateOrder = async (
    orderId: string,
    updates: { status?: OrderStatus; paymentStatus?: PaymentStatus; deliveryStatus?: DeliveryStatus },
  ) => {
    if (!accessToken) return;

    const currentOrder = orders.find((order) => order.id === orderId);
    if (!currentOrder) return;

    setError(null);
    setIsSaving(true);

    try {
      const normalizedUpdates = normalizeStatusUpdate(currentOrder, updates);
      const response = await apiRequest<{ item: AdminOrder }>(`/orders/${orderId}/status`, {
        method: "PATCH",
        token: accessToken,
        body: JSON.stringify(normalizedUpdates),
      });

      setOrders((current) =>
        current.map((order) => (order.id === orderId ? response.item : order)),
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update order");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminShell
      title="Orders"
      description="Monitor revenue, track fulfillment, and manage customer orders from one place."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Total Orders" value={String(summary.totalOrders)} />
        <SummaryCard label="Total Revenue" value={formatPrice(summary.totalRevenue)} />
        <SummaryCard label="Pending Orders" value={String(summary.pendingOrders)} />
        <SummaryCard label="Paid Orders" value={String(summary.paidOrders)} />
        <SummaryCard label="Delivered Orders" value={String(summary.deliveredOrders)} />
      </section>

      <section className="rounded-[1.75rem] border border-border/60 bg-card/90 p-5 backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as OrderFilter)}
            className="rounded-2xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-foreground"
          >
            <option value="ALL">All Orders</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="PROCESSING">Processing</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <div className="flex items-center rounded-2xl border border-border/60 bg-background/60 px-4 py-3 font-body text-sm text-muted-foreground">
            {filteredOrders.length} order{filteredOrders.length === 1 ? "" : "s"} in this view
          </div>
        </div>
      </section>

      {error ? (
        <section className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
          <p className="font-body text-sm text-destructive">{error}</p>
        </section>
      ) : null}

      {isLoading ? (
        <section className="rounded-2xl border border-border/60 bg-card/90 p-8 text-center backdrop-blur">
          <p className="font-body text-sm text-muted-foreground">Loading orders...</p>
        </section>
      ) : filteredOrders.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border/70 bg-card/90 p-8 text-center backdrop-blur">
          <p className="font-body text-sm text-muted-foreground">No orders found for this filter.</p>
        </section>
      ) : (
        <>
          <section className="space-y-4">
            {paginatedOrders.map((order) => (
              <article
                key={order.id}
                className="rounded-[1.75rem] border border-border/60 bg-card/90 p-5 backdrop-blur"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-display text-xl font-semibold text-foreground">
                          {order.reference}
                        </p>
                        <p className="mt-1 font-body text-sm text-muted-foreground">
                          {order.customerName} | {order.customerPhone}
                        </p>
                        <p className="mt-1 font-body text-sm text-muted-foreground">
                          {order.city}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          Total Amount
                        </p>
                        <p className="mt-1 font-display text-2xl font-semibold text-foreground">
                          {formatPrice(order.totalAmount)}
                        </p>
                        <p className="mt-1 font-body text-xs text-muted-foreground">
                          {formatOrderDate(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge label={order.paymentStatus} tone={getPaymentTone(order.paymentStatus)} />
                      <Badge label={order.status} tone={getOrderTone(order.status)} />
                      <Badge
                        label={formatDeliveryStatus(order.deliveryStatus)}
                        tone={getDeliveryTone(order.deliveryStatus)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 xl:justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedOrderId(order.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 font-body text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-card"
                    >
                      <Eye size={13} />
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedOrderId(order.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 font-body text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-card"
                    >
                      <PackageCheck size={13} />
                      Update Status
                    </button>
                    <a
                      href={getWhatsAppHref(order)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 font-body text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-card"
                    >
                      <MessageCircle size={13} />
                      WhatsApp Customer
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </section>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={ORDERS_PER_PAGE}
            totalItems={filteredOrders.length}
            itemLabel="order"
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {selectedOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[1.75rem] border border-border/60 bg-card p-6 shadow-2xl">
            <div className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-display text-2xl font-semibold text-foreground">
                  {selectedOrder.reference}
                </p>
                <p className="mt-1 font-body text-sm text-muted-foreground">
                  {selectedOrder.customerName} | {selectedOrder.customerPhone}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge label={selectedOrder.paymentStatus} tone={getPaymentTone(selectedOrder.paymentStatus)} />
                  <Badge label={selectedOrder.status} tone={getOrderTone(selectedOrder.status)} />
                  <Badge
                    label={formatDeliveryStatus(selectedOrder.deliveryStatus)}
                    tone={getDeliveryTone(selectedOrder.deliveryStatus)}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="rounded-full border border-border px-4 py-2 font-body text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-background"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <section className="space-y-4">
                <InfoBlock label="Customer Name" value={selectedOrder.customerName} />
                <InfoBlock label="Phone Number" value={selectedOrder.customerPhone} />
                <InfoBlock label="Email" value={selectedOrder.customerEmail || "Not provided"} />
                <InfoBlock label="City" value={selectedOrder.city} />
                <InfoBlock label="Address" value={selectedOrder.address} />
                <InfoBlock label="Payment Method" value={selectedOrder.paymentMethod} />
                <InfoBlock
                  label="Delivery Timeline"
                  value={formatDeliveryTimeline(selectedOrder.deliveryTimeline)}
                />
                <InfoBlock
                  label="Admin Notes"
                  value={selectedOrder.notes || "No notes added"}
                />
              </section>

              <section className="space-y-5">
                <div className="rounded-2xl border border-border/60 bg-background/60 p-5">
                  <p className="font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Status Controls
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-1.5 block font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        Order Status
                      </label>
                      <select
                        value={selectedOrder.status}
                        disabled={isSaving}
                        onChange={(event) =>
                          void updateOrder(selectedOrder.id, {
                            status: event.target.value as OrderStatus,
                          })
                        }
                        className="w-full rounded-2xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-foreground"
                      >
                        {getOrderStatusOptions(
                          selectedOrder.paymentStatus,
                          selectedOrder.deliveryStatus,
                        ).map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        Payment Status
                      </label>
                      <select
                        value={selectedOrder.paymentStatus}
                        disabled={isSaving}
                        onChange={(event) =>
                          void updateOrder(selectedOrder.id, {
                            paymentStatus: event.target.value as PaymentStatus,
                          })
                        }
                        className="w-full rounded-2xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-foreground"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="SUCCESS">Success</option>
                        <option value="FAILED">Failed</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        Delivery Status
                      </label>
                      <select
                        value={selectedOrder.deliveryStatus}
                        disabled={isSaving}
                        onChange={(event) =>
                          void updateOrder(selectedOrder.id, {
                            deliveryStatus: event.target.value as DeliveryStatus,
                          })
                        }
                        className="w-full rounded-2xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-foreground"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                      </select>
                    </div>
                  </div>
                  <p className="mt-4 font-body text-xs text-muted-foreground">
                    If payment is marked as Success while the order is still Pending, it will move to Processing. If delivery is marked Delivered, the order status will become Delivered automatically.
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-background/60 p-5">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <p className="font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      Items Ordered
                    </p>
                    <p className="font-display text-xl font-semibold text-foreground">
                      {formatPrice(selectedOrder.totalAmount)}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-border/60 bg-card/80 px-4 py-3"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-body text-sm font-medium text-foreground">
                              {item.productName}
                            </p>
                            <p className="font-body text-xs text-muted-foreground">
                              {item.color} | {item.length} | Qty {item.quantity}
                            </p>
                          </div>
                          <p className="font-body text-sm text-foreground">
                            {formatPrice(item.unitPrice * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
};

const SummaryCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[1.75rem] border border-border/60 bg-card/90 p-5 backdrop-blur">
    <p className="font-body text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
    <p className="mt-3 font-display text-3xl font-semibold text-foreground">{value}</p>
  </div>
);

const InfoBlock = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
    <p className="font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
    <p className="mt-2 font-body text-sm leading-relaxed text-foreground">{value}</p>
  </div>
);

const Badge = ({
  label,
  tone,
}: {
  label: string;
  tone: "primary" | "success" | "warning" | "danger" | "neutral";
}) => (
  <span
    className={`rounded-full px-3 py-1 font-body text-[11px] uppercase tracking-[0.18em] ${
      tone === "primary"
        ? "bg-primary text-primary-foreground"
        : tone === "success"
          ? "bg-accent text-accent-foreground"
          : tone === "warning"
            ? "border border-border bg-background text-foreground"
            : tone === "danger"
              ? "bg-destructive/10 text-destructive"
              : "border border-border text-muted-foreground"
    }`}
  >
    {label}
  </span>
);

const getPaymentTone = (status: PaymentStatus) => {
  switch (status) {
    case "SUCCESS":
      return "success" as const;
    case "FAILED":
      return "danger" as const;
    case "PENDING":
      return "warning" as const;
  }
};

const getOrderTone = (status: OrderStatus) => {
  switch (status) {
    case "DELIVERED":
      return "success" as const;
    case "CANCELLED":
      return "danger" as const;
    case "PROCESSING":
    case "PAID":
      return "primary" as const;
    case "PENDING":
      return "warning" as const;
  }
};

const getDeliveryTone = (status: DeliveryStatus) => {
  switch (status) {
    case "DELIVERED":
      return "success" as const;
    case "OUT_FOR_DELIVERY":
    case "SCHEDULED":
      return "primary" as const;
    case "PENDING":
      return "neutral" as const;
  }
};

export default AdminOrders;
