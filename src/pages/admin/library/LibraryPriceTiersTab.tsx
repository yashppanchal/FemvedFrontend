import { type FormEvent, useEffect, useState } from "react";
import { adminLibrary, type AdminPriceTierDto } from "../../../api/adminLibrary";
import { ApiError } from "../../../api/client";
import { LoadingScreen } from "../../../components/LoadingScreen";

const LOCATIONS = ["IN", "GB", "US"] as const;
const CURRENCY_DEFAULTS: Record<string, { code: string; symbol: string }> = {
  IN: { code: "INR", symbol: "₹" },
  GB: { code: "GBP", symbol: "£" },
  US: { code: "USD", symbol: "$" },
};

type AddForm = { tierId: string; locationCode: string; amount: string };
const emptyAdd: AddForm = { tierId: "", locationCode: "GB", amount: "" };

export default function LibraryPriceTiersTab() {
  const [tiers, setTiers] = useState<AdminPriceTierDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [addForm, setAddForm] = useState<AddForm>(emptyAdd);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");

  const load = () => {
    setLoading(true);
    adminLibrary
      .getPriceTiers()
      .then(setTiers)
      .catch((err) =>
        setLoadError(err instanceof ApiError ? err.message : "Failed to load."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    if (!addForm.tierId) {
      setFormError("Please select a tier.");
      return;
    }
    const currency = CURRENCY_DEFAULTS[addForm.locationCode];
    setSaving(true);
    try {
      await adminLibrary.addTierPrice(addForm.tierId, {
        locationCode: addForm.locationCode,
        amount: Number(addForm.amount),
        currencyCode: currency.code,
        currencySymbol: currency.symbol,
      });
      setFormSuccess("Price added.");
      setAddForm(emptyAdd);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Add failed.");
    } finally {
      setSaving(false);
    }
  };

  const onSaveEdit = async (priceId: string) => {
    setFormError(null);
    try {
      await adminLibrary.updateTierPrice(priceId, { amount: Number(editAmount) });
      setEditingPriceId(null);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Update failed.");
    }
  };

  const onDelete = async (priceId: string) => {
    if (!confirm("Remove this price?")) return;
    setDeletingId(priceId);
    try {
      await adminLibrary.deleteTierPrice(priceId);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="adminPanel" role="tabpanel" aria-label="Library price tiers">
      <div className="adminPanel__header">
        <h2 className="adminPanel__title">Library Price Tiers</h2>
        <p className="adminPanel__hint">
          Manage regional prices for each tier. Videos inherit tier pricing unless overridden.
        </p>
      </div>

      {loading && <LoadingScreen compact message="Loading…" />}
      {loadError && <p className="adminPanel__error">{loadError}</p>}
      {formSuccess && <p className="adminPanel__success">{formSuccess}</p>}
      {formError && <p className="adminPanel__error">{formError}</p>}

      <form className="form adminForm" onSubmit={onAdd} noValidate>
        <label className="field">
          <span className="field__label">Tier</span>
          <select
            className="field__input"
            value={addForm.tierId}
            onChange={(e) => setAddForm({ ...addForm, tierId: e.target.value })}
            required
          >
            <option value="">Select tier…</option>
            {tiers.map((t) => (
              <option key={t.tierId} value={t.tierId}>
                {t.displayName} ({t.tierKey})
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field__label">Region</span>
          <select
            className="field__input"
            value={addForm.locationCode}
            onChange={(e) => setAddForm({ ...addForm, locationCode: e.target.value })}
          >
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l} ({CURRENCY_DEFAULTS[l].code})
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field__label">Amount</span>
          <input
            className="field__input"
            type="number"
            step="0.01"
            value={addForm.amount}
            onChange={(e) => setAddForm({ ...addForm, amount: e.target.value })}
            required
          />
        </label>
        <div className="adminForm__actions">
          <button type="submit" className="button" disabled={saving}>
            {saving ? "Adding…" : "Add Price"}
          </button>
        </div>
      </form>

      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th>Tier</th>
              <th>Region</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tiers.flatMap((t) =>
              t.prices.length > 0
                ? t.prices.map((p) => (
                    <tr key={p.priceId}>
                      <td>{t.displayName} <span style={{ color: "var(--muted)" }}>({t.tierKey})</span></td>
                      <td>{p.locationCode}</td>
                      <td>
                        {editingPriceId === p.priceId ? (
                          <input
                            className="field__input"
                            type="number"
                            step="0.01"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            style={{ maxWidth: 120 }}
                          />
                        ) : (
                          `${p.currencySymbol}${p.amount}`
                        )}
                      </td>
                      <td>{p.currencyCode}</td>
                      <td>
                        <div className="adminActionGroup">
                          {editingPriceId === p.priceId ? (
                            <>
                              <button
                                className="adminActionButton"
                                onClick={() => onSaveEdit(p.priceId)}
                              >
                                Save
                              </button>
                              <button
                                className="adminActionButton"
                                onClick={() => setEditingPriceId(null)}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="adminActionButton"
                                onClick={() => {
                                  setEditingPriceId(p.priceId);
                                  setEditAmount(String(p.amount));
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="adminActionButton adminActionButton--danger"
                                disabled={deletingId === p.priceId}
                                onClick={() => onDelete(p.priceId)}
                              >
                                {deletingId === p.priceId ? "..." : "Remove"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                : [
                    <tr key={t.tierId}>
                      <td>{t.displayName} <span style={{ color: "var(--muted)" }}>({t.tierKey})</span></td>
                      <td colSpan={4} style={{ color: "var(--muted)" }}>
                        No prices set for this tier.
                      </td>
                    </tr>,
                  ],
            )}
            {tiers.length === 0 && (
              <tr>
                <td colSpan={5} className="adminTable__empty">
                  No tiers defined.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
