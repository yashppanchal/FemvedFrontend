import { useEffect, useState } from "react";
import { getAdminSummary, getAdminOrders, type AdminSummary } from "../../api/admin";
import { ApiError } from "../../api/client";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="summaryCard">
      <span className="summaryCard__value">{value}</span>
      <span className="summaryCard__label">{label}</span>
    </div>
  );
}

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export default function SummaryTab() {
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [revenueByCurrency, setRevenueByCurrency] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAdminSummary(), getAdminOrders()])
      .then(([s, orders]) => {
        setSummary(s);
        // Compute per-currency totals from paid orders
        const byCurrency: Record<string, number> = {};
        for (const o of orders) {
          if (o.status === "Paid" && o.currency && o.amount) {
            byCurrency[o.currency] = (byCurrency[o.currency] ?? 0) + o.amount;
          }
        }
        setRevenueByCurrency(byCurrency);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load summary.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="adminPanel__loading">Loading summary…</p>;
  if (error) return <p className="adminPanel__error">{error}</p>;
  if (!summary) return null;

  const fmt = (n: number) => new Intl.NumberFormat().format(n);

  const currencyEntries = Object.entries(revenueByCurrency);
  let revenueDisplay: string;
  if (currencyEntries.length === 0) {
    // Fallback: no paid orders found, show raw total
    revenueDisplay = fmt(summary.totalRevenue);
  } else if (currencyEntries.length === 1) {
    const [currency, amount] = currencyEntries[0];
    revenueDisplay = formatCurrency(amount, currency);
  } else {
    // Multiple currencies — show each separated by " | "
    revenueDisplay = currencyEntries
      .map(([currency, amount]) => formatCurrency(amount, currency))
      .join(" | ");
  }

  return (
    <div className="summaryGrid">
      <StatCard label="Total users" value={fmt(summary.totalUsers)} />
      <StatCard label="Total experts" value={fmt(summary.totalExperts)} />
      <StatCard label="Total programs" value={fmt(summary.totalPrograms)} />
      <StatCard label="Total orders" value={fmt(summary.totalOrders)} />
      <StatCard label="Total revenue" value={revenueDisplay} />
    </div>
  );
}
