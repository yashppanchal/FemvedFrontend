import { useEffect, useState } from "react";
import {
  getExpertEarnings,
  getExpertPayoutHistory,
  type ExpertEarningsBalance,
  type ExpertPayoutRecord,
} from "../../api/experts";
import { ApiError } from "../../api/client";

function fmt(amount: number, symbol: string) {
  return `${symbol}${amount.toFixed(2)}`;
}

export default function ExpertEarningsTab() {
  const [balance, setBalance] = useState<ExpertEarningsBalance | null>(null);
  const [payouts, setPayouts] = useState<ExpertPayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getExpertEarnings().catch(() => null),
      getExpertPayoutHistory().catch(() => [] as ExpertPayoutRecord[]),
    ])
      .then(([b, p]) => {
        setBalance(b);
        setPayouts(p);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load earnings.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="expertSection__loading">Loading earnings…</p>;
  if (error) return <p className="form__error">{error}</p>;

  return (
    <section className="expertSection">
      <h2 className="expertSection__title">Earnings &amp; Payouts</h2>

      {/* ── Balance summary ──────────────────────────────── */}
      {balance ? (
        <>
          <p className="expertSection__meta">
            Commission rate: <strong>{balance.commissionRate}%</strong>
          </p>

          {balance.totalEarned.length === 0 ? (
            <p className="expertSection__empty">No earnings recorded yet.</p>
          ) : (
            <div className="expertTableWrap">
              <table className="expertTable">
                <thead>
                  <tr>
                    <th>Currency</th>
                    <th>Total earned</th>
                    <th>Your share ({balance.commissionRate}%)</th>
                    <th>Total paid</th>
                    <th>Outstanding</th>
                  </tr>
                </thead>
                <tbody>
                  {balance.totalEarned.map((earned) => {
                    const share = balance.expertShare.find((s) => s.currencyCode === earned.currencyCode);
                    const paid = balance.totalPaid.find((p) => p.currencyCode === earned.currencyCode);
                    const outstanding = balance.outstandingBalance.find((o) => o.currencyCode === earned.currencyCode);
                    return (
                      <tr key={earned.currencyCode}>
                        <td>{earned.currencyCode}</td>
                        <td>{fmt(earned.amount, earned.currencySymbol)}</td>
                        <td><strong>{share ? fmt(share.amount, share.currencySymbol) : "—"}</strong></td>
                        <td>{paid ? fmt(paid.amount, paid.currencySymbol) : "—"}</td>
                        <td>
                          {outstanding ? (
                            <strong style={{ color: outstanding.amount > 0 ? "var(--primary)" : undefined }}>
                              {fmt(outstanding.amount, outstanding.currencySymbol)}
                            </strong>
                          ) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {balance.lastPayoutAt && (
            <p className="expertSection__meta">
              Last payout: {new Date(balance.lastPayoutAt).toLocaleDateString()}
            </p>
          )}

          <p className="expertSection__hint">
            To receive a payout, contact your account manager. Payouts are recorded by the admin team.
          </p>
        </>
      ) : (
        <p className="expertSection__empty">Earnings data not available.</p>
      )}

      {/* ── Payout history ───────────────────────────────── */}
      <h3 className="expertSection__subtitle expertSection__subtitle--mt">Payout history</h3>
      {payouts.length === 0 ? (
        <p className="expertSection__empty">No payouts received yet.</p>
      ) : (
        <div className="expertTableWrap">
          <table className="expertTable">
            <thead>
              <tr>
                <th>Amount</th>
                <th>Reference</th>
                <th>Processed by</th>
                <th>Paid at</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.payoutId}>
                  <td><strong>{fmt(p.amount, p.currencySymbol)}</strong></td>
                  <td>{p.paymentReference ?? "—"}</td>
                  <td>{p.paidByName}</td>
                  <td>{new Date(p.paidAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
