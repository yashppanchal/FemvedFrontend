import { useEffect, useState } from "react";
import { getAdminOrders, refundOrder, type AdminOrder } from "../../api/admin";
import { ApiError } from "../../api/client";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
}

export default function AdminOrdersTab() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAdminOrders()
      .then(setOrders)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load orders.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRefund = async (orderId: string, amount: number) => {
    const reason = prompt("Refund reason:");
    if (reason === null || !reason.trim()) return;
    try {
      await refundOrder(orderId, amount, reason);
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status: "Refunded" } : o))
      );
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to process refund.");
    }
  };

  const filtered = orders.filter(
    (o) =>
      (o.userName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (o.programName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (o.userEmail ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <p className="adminPanel__loading">Loading orders…</p>;
  if (error) return <p className="adminPanel__error">{error}</p>;

  return (
    <>
      <div className="adminPanel__toolbar">
        <input
          className="field__input adminPanel__search"
          type="search"
          placeholder="Search by user, email, or program…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="adminPanel__count">{filtered.length} orders</span>
      </div>

      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th>User</th>
              <th>Program</th>
              <th>Duration</th>
              <th>Amount</th>
              <th>Coupon</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="adminTable__empty">No orders found.</td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.orderId}>
                  <td>
                    <div>{o.userName}</div>
                    <div className="adminTable__sub">{o.userEmail}</div>
                  </td>
                  <td>{o.programName}</td>
                  <td>{o.durationLabel}</td>
                  <td>{formatCurrency(o.amount, o.currency)}</td>
                  <td>{o.couponCode ?? "—"}</td>
                  <td>
                    <span className={`statusBadge statusBadge--${o.status.toLowerCase()}`}>
                      {o.status}
                    </span>
                  </td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="adminTable__actions">
                    {o.status !== "Refunded" && o.status !== "Cancelled" && (
                      <button
                        type="button"
                        className="adminActionButton adminActionButton--danger"
                        onClick={() => handleRefund(o.orderId, o.amount)}
                      >
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
