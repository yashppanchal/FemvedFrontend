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

  const revenue = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(summary.totalRevenue);

  const fmt = (n: number) => new Intl.NumberFormat().format(n);

  return (
    <div className="summaryGrid">
      <StatCard label="Total users" value={fmt(summary.totalUsers)} />
      <StatCard label="Total experts" value={fmt(summary.totalExperts)} />
      <StatCard label="Total programs" value={fmt(summary.totalPrograms)} />
      <StatCard label="Total orders" value={fmt(summary.totalOrders)} />
      <StatCard label="Total revenue" value={revenue} />
    </div>
  );
}
