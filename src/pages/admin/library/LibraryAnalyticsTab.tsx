import { useEffect, useState } from "react";
import { adminLibrary, type LibraryAnalyticsDto } from "../../../api/adminLibrary";
import { ApiError } from "../../../api/client";
import { LoadingScreen } from "../../../components/LoadingScreen";

export default function LibraryAnalyticsTab() {
  const [data, setData] = useState<LibraryAnalyticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminLibrary
      .getAnalytics()
      .then(setData)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load analytics."),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen compact message="Loading analytics…" />;
  if (error) return <p className="adminPanel__error">{error}</p>;
  if (!data) return null;

  return (
    <section className="adminPanel" role="tabpanel" aria-label="Library analytics">
      <div className="adminPanel__header">
        <h2 className="adminPanel__title">Library Analytics</h2>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Videos" value={data.totalVideos} />
        <StatCard label="Published" value={data.publishedVideos} />
        <StatCard label="Draft" value={data.draftVideos} />
        <StatCard label="Archived" value={data.archivedVideos} />
        <StatCard label="Total Purchases" value={data.totalPurchases} />
        <StatCard label="Paid Orders" value={data.paidOrders} />
        <StatCard label="Failed Orders" value={data.failedOrders} />
      </div>

      {/* Revenue by currency */}
      {data.revenueByCurrency.length > 0 && (
        <>
          <h3 className="adminPanel__title" style={{ fontSize: 16, marginBottom: 10 }}>
            Revenue by Currency
          </h3>
          <div className="adminTableWrap" style={{ marginBottom: 24 }}>
            <table className="adminTable">
              <thead>
                <tr>
                  <th>Currency</th>
                  <th>Revenue</th>
                  <th>Orders</th>
                </tr>
              </thead>
              <tbody>
                {data.revenueByCurrency.map((r) => (
                  <tr key={r.currencyCode}>
                    <td>{r.currencyCode}</td>
                    <td>{r.currencySymbol}{fmt(r.totalRevenue)}</td>
                    <td>{r.orderCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Top selling videos */}
      {data.topSellingVideos.length > 0 && (
        <>
          <h3 className="adminPanel__title" style={{ fontSize: 16, marginBottom: 10 }}>
            Top Selling Videos
          </h3>
          <div className="adminTableWrap" style={{ marginBottom: 24 }}>
            <table className="adminTable">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Expert</th>
                  <th>Purchases</th>
                </tr>
              </thead>
              <tbody>
                {data.topSellingVideos.map((v) => (
                  <tr key={v.videoId}>
                    <td>{v.title}</td>
                    <td>{v.videoType}</td>
                    <td>{v.expertName}</td>
                    <td>{v.purchaseCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Monthly revenue */}
      {data.revenueByMonth.length > 0 && (
        <>
          <h3 className="adminPanel__title" style={{ fontSize: 16, marginBottom: 10 }}>
            Monthly Revenue (Last 12 Months)
          </h3>
          <div className="adminTableWrap">
            <table className="adminTable">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Currency</th>
                  <th>Revenue</th>
                  <th>Orders</th>
                </tr>
              </thead>
              <tbody>
                {data.revenueByMonth.map((m, i) => (
                  <tr key={i}>
                    <td>{m.monthLabel}</td>
                    <td>{m.currencyCode}</td>
                    <td>{m.currencySymbol}{fmt(m.totalRevenue)}</td>
                    <td>{m.orderCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 10,
        border: "1px solid rgba(15,15,16,0.08)",
        background: "rgba(255,255,255,0.9)",
      }}
    >
      <div style={{ fontSize: 24, fontWeight: 600, color: "var(--black)" }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function fmt(n: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);
}
