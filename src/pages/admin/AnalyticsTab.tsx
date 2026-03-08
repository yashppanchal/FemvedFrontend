import { useEffect, useState } from "react";
import { getAnalytics, type AnalyticsSummary } from "../../api/admin";
import { ApiError } from "../../api/client";

type Period = "week" | "month" | "year";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}

export default function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsSummary[]>([]);
  const [period, setPeriod] = useState<Period>("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAnalytics(period)
      .then(setData)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Analytics data is not available.");
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <>
      <div className="adminPanel__toolbar">
        <div className="adminPanel__segmented">
          {(["week", "month", "year"] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              className={`adminPanel__segBtn${period === p ? " adminPanel__segBtn--active" : ""}`}
              onClick={() => setPeriod(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="adminPanel__loading">Loading analytics…</p>}
      {error && <p className="adminPanel__info">{error}</p>}

      {!loading && !error && data.length === 0 && (
        <p className="adminPanel__empty">No analytics data available for this period.</p>
      )}

      {!loading && data.length > 0 && (
        <div className="adminTableWrap">
          <table className="adminTable">
            <thead>
              <tr>
                <th>Period</th>
                <th>New users</th>
                <th>New orders</th>
                <th>Revenue</th>
                <th>Active enrollments</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.period}>
                  <td>{row.period}</td>
                  <td>{row.newUsers}</td>
                  <td>{row.newOrders}</td>
                  <td>{formatCurrency(row.revenue)}</td>
                  <td>{row.activeEnrollments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
