import { useEffect, useState } from "react";
import {
  getExpertLibrarySales,
  type ExpertLibrarySalesResponse,
} from "../../api/experts";
import { ApiError } from "../../api/client";
import { LoadingScreen } from "../../components/LoadingScreen";

export default function ExpertLibrarySalesTab() {
  const [data, setData] = useState<ExpertLibrarySalesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getExpertLibrarySales()
      .then(setData)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load library sales."),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen compact message="Loading library sales…" />;
  if (error) return <p className="expertSection__error">{error}</p>;
  if (!data) return <p className="expertSection__empty">No data available.</p>;

  return (
    <section className="expertSection">
      <h2 className="expertSection__title">Library Video Sales</h2>

      {/* Summary cards */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <div className="statCard">
          <span className="statCard__value">{data.totalVideos}</span>
          <span className="statCard__label">Videos</span>
        </div>
        <div className="statCard">
          <span className="statCard__value">{data.totalPurchases}</span>
          <span className="statCard__label">Total Purchases</span>
        </div>
        {data.revenueByurrency.map((r) => (
          <div key={r.currencyCode} className="statCard">
            <span className="statCard__value">
              {r.currencySymbol}{r.totalRevenue.toLocaleString()}
            </span>
            <span className="statCard__label">Revenue ({r.currencyCode})</span>
          </div>
        ))}
      </div>

      {/* Per-video table */}
      {data.videos.length > 0 ? (
        <div className="adminTableWrap">
          <table className="adminTable">
            <thead>
              <tr>
                <th>Video Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Purchases</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {data.videos.map((v) => (
                <tr key={v.videoId}>
                  <td>{v.title}</td>
                  <td>{v.videoType}</td>
                  <td>
                    <span style={statusStyle(v.status)}>{v.status}</span>
                  </td>
                  <td>{v.purchaseCount}</td>
                  <td>{new Date(v.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="expertSection__empty">No library videos yet.</p>
      )}
    </section>
  );
}

function statusStyle(status: string): React.CSSProperties {
  const base: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    padding: "3px 8px",
    borderRadius: 4,
  };
  switch (status) {
    case "PUBLISHED":
      return { ...base, background: "rgba(42, 122, 59, 0.12)", color: "#2a7a3b" };
    case "DRAFT":
      return { ...base, background: "rgba(86, 19, 27, 0.08)", color: "var(--primary, #56131b)" };
    default:
      return { ...base, background: "rgba(15, 15, 16, 0.08)", color: "rgba(15, 15, 16, 0.5)" };
  }
}
