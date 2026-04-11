import { type FormEvent, useEffect, useState } from "react";
import {
  getExpertPayoutAnalytics,
  recordExpertPayout,
  type ExpertPayoutBalance,
  type CurrencyAmount,
} from "../../api/admin";
import { ApiError } from "../../api/client";
import { LoadingScreen } from "../../components/LoadingScreen";
import { PAGE_SIZE } from "../../constants";
import { useToast } from "../../useToast";

function formatBalance(amounts: CurrencyAmount[]): string {
  if (amounts.length === 0) return "—";
  return amounts
    .map((a) => `${a.currencySymbol}${a.amount.toFixed(2)}`)
    .join(", ");
}

const emptyForm = {
  expertId: "",
  amount: "",
  currencyCode: "",
  paidAt: new Date().toISOString().slice(0, 16),
  paymentReference: "",
  notes: "",
};

export default function ExpertPayoutsTab() {
  const [balances, setBalances] = useState<ExpertPayoutBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast, showSuccess } = useToast();

  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    getExpertPayoutAnalytics()
      .then(setBalances)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load payout data.");
      })
      .finally(() => setLoading(false));
  }, []);

  const openRecord = (expertId: string, currencyCode: string) => {
    setForm({ ...emptyForm, expertId, currencyCode });
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const amount = Number(form.amount);
    if (!form.expertId || !amount || amount <= 0 || !form.currencyCode) {
      setFormError("Expert, amount, and currency are required.");
      return;
    }
    if (!confirm(`Record payout of ${amount} ${form.currencyCode}? This action cannot be undone.`)) return;
    setSubmitting(true);
    try {
      await recordExpertPayout({
        expertId: form.expertId,
        amount,
        currencyCode: form.currencyCode,
        paidAt: new Date(form.paidAt).toISOString(),
        paymentReference: form.paymentReference || undefined,
        notes: form.notes || undefined,
      });
      setShowForm(false);
      showSuccess("Payout recorded successfully.");
      // Reload balances silently
      const updated = await getExpertPayoutAnalytics();
      setBalances(updated);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to record payout.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen compact message="Loading payouts…" />;
  if (error) return <p className="adminPanel__error">{error}</p>;

  return (
    <>
      <div className="adminPanel__toolbar">
        <span className="adminPanel__count">{balances.length} experts</span>
        {Math.ceil(balances.length / PAGE_SIZE) > 1 && (
          <div className="adminPanel__pagination">
            <button type="button" className="adminActionButton" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{Math.min(page * PAGE_SIZE, balances.length)} of {balances.length}</span>
            <button type="button" className="adminActionButton" disabled={page >= Math.ceil(balances.length / PAGE_SIZE)} onClick={() => setPage((p) => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {toast && <p role="alert" aria-live="polite" className={`adminPanel__${toast.type}`}>{toast.message}</p>}

      {showForm && (
        <form className="adminForm" onSubmit={handleSubmit} noValidate>
          <h3 className="adminForm__title">Record payout</h3>
          {formError && <p className="adminPanel__error">{formError}</p>}
          <div className="adminForm__row">
            <label className="field">
              <span className="field__label">Amount *</span>
              <input
                className="field__input"
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                disabled={submitting}
              />
            </label>
            <label className="field">
              <span className="field__label">Currency</span>
              <input
                className="field__input"
                type="text"
                maxLength={3}
                value={form.currencyCode}
                onChange={(e) => setForm((p) => ({ ...p, currencyCode: e.target.value.toUpperCase() }))}
                disabled={submitting}
              />
            </label>
            <label className="field">
              <span className="field__label">Paid at *</span>
              <input
                className="field__input"
                type="datetime-local"
                value={form.paidAt}
                onChange={(e) => setForm((p) => ({ ...p, paidAt: e.target.value }))}
                disabled={submitting}
              />
            </label>
          </div>
          <div className="adminForm__row">
            <label className="field">
              <span className="field__label">Payment reference</span>
              <input
                className="field__input"
                type="text"
                value={form.paymentReference}
                onChange={(e) => setForm((p) => ({ ...p, paymentReference: e.target.value }))}
                disabled={submitting}
                placeholder="Bank ref / PayPal ID"
              />
            </label>
            <label className="field">
              <span className="field__label">Notes</span>
              <input
                className="field__input"
                type="text"
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                disabled={submitting}
              />
            </label>
          </div>
          <div className="adminForm__actions">
            <button type="button" className="adminActionButton" onClick={() => setShowForm(false)} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="button" disabled={submitting}>
              {submitting ? "Saving…" : "Record payout"}
            </button>
          </div>
        </form>
      )}

      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th scope="col">Expert</th>
              <th scope="col">Commission</th>
              <th scope="col">Expert share owed</th>
              <th scope="col">Total paid</th>
              <th scope="col">Outstanding</th>
              <th scope="col">Last payout</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {balances.length === 0 ? (
              <tr>
                <td colSpan={7} className="adminTable__empty">No payout data.</td>
              </tr>
            ) : (
              balances.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((b) => (
                <tr key={b.expertId}>
                  <td>{b.expertName}</td>
                  <td>{b.commissionRate}%</td>
                  <td>{formatBalance(b.expertShare)}</td>
                  <td>{formatBalance(b.totalPaid)}</td>
                  <td>{formatBalance(b.outstandingBalance)}</td>
                  <td>{b.lastPayoutAt ? new Date(b.lastPayoutAt).toLocaleDateString() : "Never"}</td>
                  <td className="adminTable__actions">
                    <button
                      type="button"
                      className="adminActionButton"
                      onClick={() => openRecord(b.expertId, b.outstandingBalance[0]?.currencyCode ?? "GBP")}
                    >
                      Record payout
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
