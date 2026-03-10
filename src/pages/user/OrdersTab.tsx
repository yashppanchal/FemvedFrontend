import { useEffect, useState } from "react";
import { getMyOrders, type MyOrder } from "../../api/users";
import { ApiError } from "../../api/client";

function formatCurrency(amount: number | null | undefined, currency: string | null | undefined) {
  if (amount == null) return "—";
  if (!currency) return amount.toFixed(2);
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load orders.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="dashCard__loading">Loading orders…</p>;
  if (error) return <p className="dashCard__error">{error}</p>;

  return (
    <div className="dashCard dashCard--wide">
      <div className="dashCard__header">
        <h2 className="dashCard__heading">Order History</h2>
      </div>
      {orders.length === 0 ? (
        <p className="dashCard__empty">No orders found.</p>
      ) : (
        <div className="dashTableWrap">
          <table className="dashTable">
            <thead>
              <tr>
                <th>Program</th>
                <th>Duration</th>
                <th>Amount</th>
                <th>Discount</th>
                <th>Coupon</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.orderId}>
                  <td>{o.programName}</td>
                  <td>{o.durationLabel}</td>
                  <td>{formatCurrency(o.amount, o.currency)}</td>
                  <td>{o.discountAmount > 0 ? formatCurrency(o.discountAmount, o.currency) : "—"}</td>
                  <td>{o.couponCode ?? "—"}</td>
                  <td>
                    <span className={`statusBadge statusBadge--${o.status.toLowerCase()}`}>
                      {o.status}
                    </span>
                  </td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
