import { useEffect, useState } from "react";

const PAGE_SIZE = 20;
import { getAdminOrders, refundOrder, type AdminOrder } from "../../api/admin";
import { ApiError } from "../../api/client";

function formatCurrency(amount: number | null | undefined, currency: string | null | undefined) {
  if (amount == null) return "—";
  if (!currency) return amount.toFixed(2);
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
}

export default function AdminOrdersTab() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

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

  // Reset to page 1 when search changes
  useEffect(() => { setPage(1); }, [search]);

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
        {Math.ceil(filtered.length / PAGE_SIZE) > 1 && (
          <div className="adminPanel__pagination">
            <button type="button" className="adminActionButton" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>Page {page} of {Math.ceil(filtered.length / PAGE_SIZE)}</span>
            <button type="button" className="adminActionButton" disabled={page >= Math.ceil(filtered.length / PAGE_SIZE)} onClick={() => setPage((p) => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th>User</th>
              <th>Program</th>
              <th>Duration</th>
              <th>Amount</th>
              <th>Gateway</th>
              <th>Coupon</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="adminTable__empty">No orders found.</td>
              </tr>
            ) : (
              filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((o) => (
                <tr key={o.orderId}>
                  <td>
                    <div>{o.userName}</div>
                    <div className="adminTable__sub">{o.userEmail}</div>
                  </td>
                  <td>{o.programName}</td>
                  <td>{o.durationLabel}</td>
                  <td>{formatCurrency(o.amount, o.currency)}</td>
                  <td>
                    <span className={`statusBadge statusBadge--${(o.gateway ?? "").toLowerCase()}`}>
                      {o.gateway ?? "—"}
                    </span>
                  </td>
                  <td>{o.couponCode ?? "—"}</td>
                  <td>
                    <span className={`statusBadge statusBadge--${(o.status ?? "").toLowerCase()}`}>
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
