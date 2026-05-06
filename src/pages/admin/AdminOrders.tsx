import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { useCurrency } from "@/context/CurrencyContext";
import type { AdminOrder, DeliveryStatus, OrderStatus, PaymentStatus } from "@/types/order";

const AdminOrders = () => {
  const { accessToken } = useAuth();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<"ALL" | OrderStatus>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    if (!accessToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const query = statusFilter === "ALL" ? "" : `?status=${statusFilter}`;
      const response = await apiRequest<{ items: AdminOrder[] }>(`/orders${query}`, {
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
  }, [accessToken, statusFilter]);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + order.totalAmount, 0),
    [orders],
  );

  const updateOrder = async (
    orderId: string,
    updates: { status?: OrderStatus; paymentStatus?: PaymentStatus; deliveryStatus?: DeliveryStatus },
  ) => {
    if (!accessToken) return;

    try {
      const response = await apiRequest<{ item: AdminOrder }>(`/orders/${orderId}/status`, {
        method: "PATCH",
        token: accessToken,
        body: JSON.stringify(updates),
      });

      setOrders((current) =>
        current.map((order) => (order.id === orderId ? response.item : order)),
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update order");
    }
  };

  return (
    <AdminShell
      title="Orders"
      description="Track real customer orders, payment states, and fulfillment progress."
    >
      <section className="rounded-2xl border border-border/60 bg-card/90 p-5 backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-[220px_220px_1fr]">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "ALL" | OrderStatus)}
            className="rounded-2xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-foreground"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="PROCESSING">Processing</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
            <p className="font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Revenue
            </p>
            <p className="mt-1 font-display text-lg font-semibold text-foreground">
              {formatPrice(totalRevenue)}
            </p>
          </div>

          <div className="flex items-center rounded-2xl border border-border/60 bg-background/60 px-4 py-3 font-body text-sm text-muted-foreground">
            {orders.length} order{orders.length === 1 ? "" : "s"}
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
      ) : orders.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border/70 bg-card/90 p-8 text-center backdrop-blur">
          <p className="font-body text-sm text-muted-foreground">No orders found yet.</p>
        </section>
      ) : (
        <section className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-[1.75rem] border border-border/60 bg-card/90 p-5 backdrop-blur"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div>
                    <p className="font-display text-xl font-semibold text-foreground">
                      {order.reference}
                    </p>
                    <p className="mt-1 font-body text-sm text-muted-foreground">
                      {order.customerName} | {order.customerPhone} | {order.city}
                    </p>
                    <p className="mt-1 font-body text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {order.deliveryTimeline === "SAME_DAY" ? "Same-day delivery" : "Next-day delivery"}
                    </p>
                  </div>

                  <p className="font-body text-sm leading-relaxed text-muted-foreground">
                    {order.address}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <Badge label={order.status} tone="primary" />
                    <Badge label={`Payment ${order.paymentStatus}`} tone="secondary" />
                    <Badge
                      label={`Delivery ${order.deliveryStatus.replaceAll("_", " ")}`}
                      tone="secondary"
                    />
                    <Badge label={order.paymentMethod} tone="neutral" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:w-[500px]">
                  <select
                    value={order.status}
                    onChange={(event) =>
                      void updateOrder(order.id, { status: event.target.value as OrderStatus })
                    }
                    className="rounded-2xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-foreground"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>

                  <select
                    value={order.paymentStatus}
                    onChange={(event) =>
                      void updateOrder(order.id, {
                        paymentStatus: event.target.value as PaymentStatus,
                      })
                    }
                    className="rounded-2xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-foreground"
                  >
                    <option value="PENDING">Payment Pending</option>
                    <option value="SUCCESS">Payment Success</option>
                    <option value="FAILED">Payment Failed</option>
                  </select>

                  <select
                    value={order.deliveryStatus}
                    onChange={(event) =>
                      void updateOrder(order.id, {
                        deliveryStatus: event.target.value as DeliveryStatus,
                      })
                    }
                    className="rounded-2xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground outline-none transition-colors focus:border-foreground"
                  >
                    <option value="PENDING">Delivery Pending</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                    <option value="DELIVERED">Delivered</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-border/60 bg-background/60 p-4">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <p className="font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Items
                  </p>
                  <p className="font-display text-lg font-semibold text-foreground">
                    {formatPrice(order.totalAmount)}
                  </p>
                </div>

                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-1 rounded-xl border border-border/60 bg-card/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
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
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </AdminShell>
  );
};

const Badge = ({
  label,
  tone,
}: {
  label: string;
  tone: "primary" | "secondary" | "neutral";
}) => (
  <span
    className={`rounded-full px-3 py-1 font-body text-[11px] uppercase tracking-[0.18em] ${
      tone === "primary"
        ? "bg-primary text-primary-foreground"
        : tone === "secondary"
          ? "bg-accent text-accent-foreground"
          : "border border-border text-muted-foreground"
    }`}
  >
    {label}
  </span>
);

export default AdminOrders;
