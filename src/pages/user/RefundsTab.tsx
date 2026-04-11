import { useEffect, useState } from "react";
import { getMyRefunds, type MyRefund } from "../../api/users";
import { ApiError } from "../../api/client";
import { LoadingScreen } from "../../components/LoadingScreen";

import { PAGE_SIZE } from "../../constants";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
}

export default function RefundsTab() {
  const [refunds, setRefunds] = useState<MyRefund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getMyRefunds()
      .then(setRefunds)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load refunds.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen compact message="Loading refunds…" />;
  if (error) return <p className="dashCard__error">{error}</p>;

  return (
    <div className="dashCard dashCard--wide">
      <div className="dashCard__header">
        <h2 className="dashCard__heading">Refunds</h2>
      </div>
      {refunds.length === 0 ? (
        <p className="dashCard__empty">No refunds found.</p>
      ) : (
        <>
          {Math.ceil(refunds.length / PAGE_SIZE) > 1 && (
            <div className="dashPanel__pagination" style={{ marginBottom: 12 }}>
              <button type="button" className="dashTable__btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>{Math.min(page * PAGE_SIZE, refunds.length)} of {refunds.length}</span>
              <button type="button" className="dashTable__btn" disabled={page >= Math.ceil(refunds.length / PAGE_SIZE)} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          )}
          <div className="dashTableWrap">
            <table className="dashTable">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Requested</th>
                  <th>Resolved</th>
                </tr>
              </thead>
              <tbody>
                {refunds.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((r) => (
                  <tr key={r.refundId}>
                    <td>{r.programName}</td>
                    <td>{formatCurrency(r.amount, r.currency)}</td>
                    <td>{r.reason}</td>
                    <td>
                      <span className={`statusBadge statusBadge--${(r.status || "").toLowerCase()}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>{r.resolvedAt ? new Date(r.resolvedAt).toLocaleDateString() : "Pending"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
