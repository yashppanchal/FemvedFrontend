import { useEffect, useState } from "react";
import { getMyOrders, type MyOrder } from "../../api/users";
import { ApiError } from "../../api/client";
import { LoadingScreen } from "../../components/LoadingScreen";

import { PAGE_SIZE } from "../../constants";
const STATUS_OPTIONS = ["All", "Paid", "Pending", "Failed", "Cancelled", "Refunded"];

function formatCurrency(amount: number | null | undefined, currency: string | null | undefined) {
  if (amount == null) return "—";
  if (!currency) return amount.toFixed(2);
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load orders.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const filtered = orders.filter((o) => {
    if (statusFilter !== "All" && (o.status ?? "") !== statusFilter) return false;
    const q = search.toLowerCase();
    return (o.programName ?? "").toLowerCase().includes(q) || (o.couponCode ?? "").toLowerCase().includes(q);
  });

  if (loading) return <LoadingScreen compact message="Loading orders…" />;
  if (error) return <p className="dashCard__error">{error}</p>;

  return (
    <div className="dashCard">
      <div className="dashCard__header">
        <h2 className="dashCard__heading">Order History</h2>
      </div>

      <div className="dashPanel__toolbar">
        <input
          className="field__input dashPanel__search"
          type="search"
          placeholder="Search by program or coupon…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="field__input dashPanel__select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === "All" ? "All statuses" : s}</option>
          ))}
        </select>
        <span className="dashPanel__count">{filtered.length} orders</span>
        {Math.ceil(filtered.length / PAGE_SIZE) > 1 && (
          <div className="dashPanel__pagination">
            <button type="button" className="dashTable__btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            <button type="button" className="dashTable__btn" disabled={page >= Math.ceil(filtered.length / PAGE_SIZE)} onClick={() => setPage((p) => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
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
              {filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((o) => (
                <tr key={o.orderId}>
                  <td>{o.programName}</td>
                  <td>{o.durationLabel}</td>
                  <td>{formatCurrency(o.amount, o.currency)}</td>
                  <td>{o.discountAmount > 0 ? formatCurrency(o.discountAmount, o.currency) : "—"}</td>
                  <td>{o.couponCode ?? "—"}</td>
                  <td>
                    <span className={`statusBadge statusBadge--${(o.status || "").toLowerCase()}`}>
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
