import { useEffect, useState } from "react";
import {
  getSalesAnalytics,
  getUserAnalytics,
  getProgramAnalytics,
  type SalesAnalytics,
  type UserAnalytics,
  type ProgramAnalytics,
  type CurrencyAmount,
} from "../../api/admin";
import { ApiError } from "../../api/client";

type SubTab = "sales" | "users" | "programs";

function fmt(n: number) {
  return new Intl.NumberFormat().format(n);
}

function fmtPct(n: number) {
  return n.toFixed(1) + "%";
}

function CurrencyAmountList({ items }: { items: CurrencyAmount[] }) {
  if (!items || items.length === 0) return <span>—</span>;
  return (
    <>
      {items.map((c) => (
        <span key={c.currencyCode} style={{ display: "block" }}>
          {c.currencySymbol}{new Intl.NumberFormat().format(c.amount)}
        </span>
      ))}
    </>
  );
}

// ── Sales Sub-Tab ─────────────────────────────────────────────────────────────

function SalesTab() {
  const [data, setData] = useState<SalesAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSalesAnalytics()
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load sales analytics."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="adminPanel__loading">Loading sales analytics…</p>;
  if (error) return <p className="adminPanel__error">{error}</p>;
  if (!data) return null;

  return (
    <div className="analyticsSection">
      {/* Order funnel */}
      <div className="summaryGrid" style={{ marginBottom: 24 }}>
        <div className="summaryCard"><span className="summaryCard__value">{fmt(data.totalOrders)}</span><span className="summaryCard__label">Total orders</span></div>
        <div className="summaryCard"><span className="summaryCard__value">{fmt(data.paidOrders)}</span><span className="summaryCard__label">Paid</span></div>
        <div className="summaryCard"><span className="summaryCard__value">{fmt(data.pendingOrders)}</span><span className="summaryCard__label">Pending</span></div>
        <div className="summaryCard"><span className="summaryCard__value">{fmt(data.failedOrders)}</span><span className="summaryCard__label">Failed</span></div>
        <div className="summaryCard"><span className="summaryCard__value">{fmt(data.refundedOrders)}</span><span className="summaryCard__label">Refunded</span></div>
        <div className="summaryCard"><span className="summaryCard__value">{fmt(data.ordersWithDiscount)}</span><span className="summaryCard__label">With discount</span></div>
      </div>

      {/* Revenue by currency */}
      {data.revenueByCurrentcy.length > 0 && (
        <>
          <h3 className="analyticsSection__heading">Revenue by currency</h3>
          <div className="adminTableWrap" style={{ marginBottom: 24 }}>
            <table className="adminTable">
              <thead><tr><th>Currency</th><th>Orders</th><th>Total revenue</th><th>Avg. order value</th></tr></thead>
              <tbody>
                {data.revenueByCurrentcy.map((c) => (
                  <tr key={c.currencyCode}>
                    <td>{c.currencySymbol} {c.currencyCode}</td>
                    <td>{fmt(c.orderCount)}</td>
                    <td>{c.currencySymbol}{fmt(c.totalRevenue)}</td>
                    <td>{c.currencySymbol}{c.averageOrderValue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Revenue by gateway */}
      {data.revenueByGateway.length > 0 && (
        <>
          <h3 className="analyticsSection__heading">Revenue by gateway</h3>
          <div className="adminTableWrap" style={{ marginBottom: 24 }}>
            <table className="adminTable">
              <thead><tr><th>Gateway</th><th>Currency</th><th>Orders</th><th>Revenue</th></tr></thead>
              <tbody>
                {data.revenueByGateway.map((g, i) => (
                  <tr key={i}>
                    <td>{g.gateway}</td>
                    <td>{g.currencySymbol} {g.currencyCode}</td>
                    <td>{fmt(g.orderCount)}</td>
                    <td>{g.currencySymbol}{fmt(g.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Revenue by country */}
      {data.revenueByCountry.length > 0 && (
        <>
          <h3 className="analyticsSection__heading">Revenue by country</h3>
          <div className="adminTableWrap" style={{ marginBottom: 24 }}>
            <table className="adminTable">
              <thead><tr><th>Country</th><th>Currency</th><th>Orders</th><th>Revenue</th></tr></thead>
              <tbody>
                {data.revenueByCountry.map((c, i) => (
                  <tr key={i}>
                    <td>{c.locationCode}</td>
                    <td>{c.currencySymbol} {c.currencyCode}</td>
                    <td>{fmt(c.orderCount)}</td>
                    <td>{c.currencySymbol}{fmt(c.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Monthly trend */}
      {data.revenueByMonth.length > 0 && (
        <>
          <h3 className="analyticsSection__heading">Monthly trend (last 12 months)</h3>
          <div className="adminTableWrap">
            <table className="adminTable">
              <thead><tr><th>Month</th><th>Currency</th><th>Orders</th><th>Revenue</th></tr></thead>
              <tbody>
                {data.revenueByMonth.map((m, i) => (
                  <tr key={i}>
                    <td>{m.monthLabel}</td>
                    <td>{m.currencySymbol} {m.currencyCode}</td>
                    <td>{fmt(m.orderCount)}</td>
                    <td>{m.currencySymbol}{fmt(m.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {data.revenueByCurrentcy.length === 0 && data.revenueByMonth.length === 0 && (
        <p className="adminPanel__empty">No sales data yet.</p>
      )}
    </div>
  );
}

// ── Users Sub-Tab ─────────────────────────────────────────────────────────────

function UsersTab() {
  const [data, setData] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUserAnalytics()
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load user analytics."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="adminPanel__loading">Loading user analytics…</p>;
  if (error) return <p className="adminPanel__error">{error}</p>;
  if (!data) return null;

  return (
    <div className="analyticsSection">
      <div className="summaryGrid" style={{ marginBottom: 24 }}>
        <div className="summaryCard"><span className="summaryCard__value">{fmt(data.totalRegistered)}</span><span className="summaryCard__label">Registered users</span></div>
        <div className="summaryCard"><span className="summaryCard__value">{fmt(data.totalBuyers)}</span><span className="summaryCard__label">Buyers</span></div>
        <div className="summaryCard"><span className="summaryCard__value">{fmt(data.repeatBuyers)}</span><span className="summaryCard__label">Repeat buyers</span></div>
        <div className="summaryCard"><span className="summaryCard__value">{fmtPct(data.conversionRate)}</span><span className="summaryCard__label">Conversion rate</span></div>
        <div className="summaryCard"><span className="summaryCard__value">{fmtPct(data.repeatRatio)}</span><span className="summaryCard__label">Repeat ratio</span></div>
      </div>

      {data.newUsersByMonth.length > 0 && (
        <>
          <h3 className="analyticsSection__heading">New users by month</h3>
          <div className="adminTableWrap" style={{ marginBottom: 24 }}>
            <table className="adminTable">
              <thead><tr><th>Month</th><th>New users</th><th>New buyers</th></tr></thead>
              <tbody>
                {data.newUsersByMonth.map((m, i) => (
                  <tr key={i}>
                    <td>{m.monthLabel}</td>
                    <td>{fmt(m.newUsers)}</td>
                    <td>{fmt(m.newBuyers)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {data.cohorts.length > 0 && (
        <>
          <h3 className="analyticsSection__heading">Cohort analysis</h3>
          <div className="adminTableWrap">
            <table className="adminTable adminTable--wide">
              <thead>
                <tr>
                  <th>Cohort</th>
                  <th>Registered</th>
                  <th>Bought ≤30d</th>
                  <th>Bought ≤60d</th>
                  <th>Bought ≤90d</th>
                  <th>30d rate</th>
                </tr>
              </thead>
              <tbody>
                {data.cohorts.map((c, i) => (
                  <tr key={i}>
                    <td>{c.monthLabel}</td>
                    <td>{fmt(c.usersRegistered)}</td>
                    <td>{fmt(c.purchasedWithin30Days)}</td>
                    <td>{fmt(c.purchasedWithin60Days)}</td>
                    <td>{fmt(c.purchasedWithin90Days)}</td>
                    <td>{fmtPct(c.rate30Days)}</td>
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

// ── Programs Sub-Tab ──────────────────────────────────────────────────────────

function ProgramsTab() {
  const [data, setData] = useState<ProgramAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProgramAnalytics()
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load program analytics."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="adminPanel__loading">Loading program analytics…</p>;
  if (error) return <p className="adminPanel__error">{error}</p>;
  if (!data) return null;

  return (
    <div className="analyticsSection">
      {data.programs.length > 0 && (
        <>
          <h3 className="analyticsSection__heading">Programs</h3>
          <div className="adminTableWrap" style={{ marginBottom: 24 }}>
            <table className="adminTable adminTable--wide">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Expert</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Sales</th>
                  <th>Active</th>
                  <th>Completed</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.programs.map((p) => (
                  <tr key={p.programId}>
                    <td>{p.programName ?? "—"}</td>
                    <td>{p.expertName}</td>
                    <td>{p.categoryName}</td>
                    <td>
                      <span className={`statusBadge statusBadge--${p.status.toLowerCase()}`}>{p.status}</span>
                    </td>
                    <td>{fmt(p.totalSales)}</td>
                    <td>{fmt(p.activeEnrollments)}</td>
                    <td>{fmt(p.completedEnrollments)}</td>
                    <td><CurrencyAmountList items={p.revenue} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {data.experts.length > 0 && (
        <>
          <h3 className="analyticsSection__heading">Experts</h3>
          <div className="adminTableWrap">
            <table className="adminTable adminTable--wide">
              <thead>
                <tr>
                  <th>Expert</th>
                  <th>Commission</th>
                  <th>Sales</th>
                  <th>Enrollments</th>
                  <th>Active</th>
                  <th>Total revenue</th>
                  <th>Expert share</th>
                  <th>Platform</th>
                </tr>
              </thead>
              <tbody>
                {data.experts.map((e) => (
                  <tr key={e.expertId}>
                    <td>{e.expertName}</td>
                    <td>{e.commissionRate}%</td>
                    <td>{fmt(e.totalSales)}</td>
                    <td>{fmt(e.totalEnrollments)}</td>
                    <td>{fmt(e.activeEnrollments)}</td>
                    <td><CurrencyAmountList items={e.totalRevenue} /></td>
                    <td><CurrencyAmountList items={e.expertShare} /></td>
                    <td><CurrencyAmountList items={e.platformRevenue} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {data.programs.length === 0 && data.experts.length === 0 && (
        <p className="adminPanel__empty">No program data yet.</p>
      )}
    </div>
  );
}

// ── Main AnalyticsTab ─────────────────────────────────────────────────────────

export default function AnalyticsTab() {
  const [subTab, setSubTab] = useState<SubTab>("sales");

  return (
    <>
      <div className="adminPanel__toolbar">
        <div className="adminPanel__segmented">
          {(["sales", "users", "programs"] as SubTab[]).map((t) => (
            <button
              key={t}
              type="button"
              className={`adminPanel__segBtn${subTab === t ? " adminPanel__segBtn--active" : ""}`}
              onClick={() => setSubTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {subTab === "sales" && <SalesTab />}
      {subTab === "users" && <UsersTab />}
      {subTab === "programs" && <ProgramsTab />}
    </>
  );
}
