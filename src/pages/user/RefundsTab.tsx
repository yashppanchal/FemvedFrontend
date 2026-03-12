import { useEffect, useState } from "react";
import { getMyRefunds, type MyRefund } from "../../api/users";
import { ApiError } from "../../api/client";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
}

export default function RefundsTab() {
  const [refunds, setRefunds] = useState<MyRefund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyRefunds()
      .then(setRefunds)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load refunds.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="dashCard__loading">Loading refunds…</p>;
  if (error) return <p className="dashCard__error">{error}</p>;

  return (
    <div className="dashCard dashCard--wide">
      <div className="dashCard__header">
        <h2 className="dashCard__heading">Refunds</h2>
      </div>
      {refunds.length === 0 ? (
        <p className="dashCard__empty">No refunds found.</p>
      ) : (
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
              {refunds.map((r) => (
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
      )}
    </div>
  );
}
