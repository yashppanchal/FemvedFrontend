import { useEffect, useState } from "react";
import { getAdminSummary, type AdminSummary } from "../../api/admin";
import { ApiError } from "../../api/client";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="summaryCard">
      <span className="summaryCard__value">{value}</span>
      <span className="summaryCard__label">{label}</span>
    </div>
  );
}

export default function SummaryTab() {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminSummary()
      .then(setSummary)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load summary.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="adminPanel__loading">Loading summary…</p>;
  if (error) return <p className="adminPanel__error">{error}</p>;
  if (!summary) return null;

  const revenue = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(summary.totalRevenue);

  return (
    <div className="summaryGrid">
      <StatCard label="Total users" value={summary.totalUsers} />
      <StatCard label="Total experts" value={summary.totalExperts} />
      <StatCard label="Total programs" value={summary.totalPrograms} />
      <StatCard label="Total orders" value={summary.totalOrders} />
      <StatCard label="Total revenue" value={revenue} />
    </div>
  );
}
