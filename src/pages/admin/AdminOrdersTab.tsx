import { useEffect, useState } from "react";

const PAGE_SIZE = 20;
import { getAdminOrders, refundOrder, type AdminOrder } from "../../api/admin";
import { ApiError } from "../../api/client";

function formatCurrency(amount: number | null | undefined, currency: string | null | undefined) {
  if (amount == null) return "—";
  if (!currency) return amount.toFixed(2);
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
}

interface RefundTarget {
  orderId: string;
  amount: number;
  currency: string | null;
  userName: string;
  programName: string;
}

export default function AdminOrdersTab() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);

  // Refund modal
  const [refundTarget, setRefundTarget] = useState<RefundTarget | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refunding, setRefunding] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  useEffect(() => {
    getAdminOrders()
      .then(setOrders)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load orders.");
      })
      .finally(() => setLoading(false));
  }, []);

  const openRefund = (o: AdminOrder) => {
    setRefundTarget({ orderId: o.orderId, amount: o.amount, currency: o.currency, userName: o.userName, programName: o.programName });
    setRefundReason("");
    setRefundError(null);
  };

  const handleRefundConfirm = async () => {
    if (!refundTarget || !refundReason.trim()) {
      setRefundError("Please enter a reason for the refund.");
      return;
    }
    setRefunding(true);
    setRefundError(null);
    try {
      await refundOrder(refundTarget.orderId, refundTarget.amount, refundReason.trim());
      setOrders((prev) =>
        prev.map((o) => (o.orderId === refundTarget.orderId ? { ...o, status: "Refunded" } : o))
      );
      setRefundTarget(null);
    } catch (err) {
      setRefundError(err instanceof ApiError ? err.message : "Failed to process refund.");
    } finally {
      setRefunding(false);
    }
  };

  const STATUS_OPTIONS = ["All", "Paid", "Pending", "Failed", "Cancelled", "Refunded"];

  const filtered = orders.filter((o) => {
    if (statusFilter !== "All" && (o.status ?? "") !== statusFilter) return false;
    const q = search.toLowerCase();
    return (
      (o.userName ?? "").toLowerCase().includes(q) ||
      (o.programName ?? "").toLowerCase().includes(q) ||
      (o.userEmail ?? "").toLowerCase().includes(q)
    );
  });

  // Reset to page 1 when search or filter changes
  useEffect(() => { setPage(1); }, [search, statusFilter]);

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
        <select
          className="field__input adminPanel__select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === "All" ? "All statuses" : s}</option>
          ))}
        </select>
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
                        onClick={() => openRefund(o)}
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

      {/* Refund confirmation modal */}
      {refundTarget && (
        <div className="adminModal__backdrop" onClick={() => { if (!refunding) setRefundTarget(null); }}>
          <div className="adminModal" style={{ maxWidth: 480 }} onClick={(ev) => ev.stopPropagation()}>
            <div className="adminModal__header">
              <h3 className="adminModal__title">Confirm Refund</h3>
              <button type="button" className="adminModal__close" onClick={() => setRefundTarget(null)} disabled={refunding}>✕</button>
            </div>
            <div className="adminModal__body">
              <p style={{ margin: "0 0 4px", fontSize: 14 }}>
                <strong>{refundTarget.userName}</strong> — {refundTarget.programName}
              </p>
              <p style={{ margin: "0 0 16px", fontSize: 14 }}>
                Refund amount: <strong>{formatCurrency(refundTarget.amount, refundTarget.currency)}</strong>
              </p>
              <p style={{ margin: "0 0 6px", fontSize: 13, color: "var(--muted)" }}>
                This action cannot be undone. Please enter a reason:
              </p>
              <textarea
                className="field__input adminModal__textarea"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Reason for refund…"
                disabled={refunding}
                style={{ minHeight: 72 }}
              />
              {refundError && <p className="adminPanel__error" style={{ marginTop: 8 }}>{refundError}</p>}
            </div>
            <div className="adminModal__compose">
              <button type="button" className="adminActionButton" onClick={() => setRefundTarget(null)} disabled={refunding}>
                Cancel
              </button>
              <button
                type="button"
                className="adminActionButton adminActionButton--danger"
                onClick={handleRefundConfirm}
                disabled={refunding || !refundReason.trim()}
              >
                {refunding ? "Processing…" : `Refund ${formatCurrency(refundTarget.amount, refundTarget.currency)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
