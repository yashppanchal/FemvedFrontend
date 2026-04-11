import { type FormEvent, useEffect, useState } from "react";
import {
  getAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon,
  type AdminCoupon,
  type CreateCouponRequest,
} from "../../api/admin";
import { ApiError } from "../../api/client";
import { LoadingScreen } from "../../components/LoadingScreen";
import { PAGE_SIZE } from "../../constants";
import { useToast } from "../../useToast";

const emptyForm: CreateCouponRequest & { isActive: boolean } = {
  code: "",
  discountType: "Percentage",
  discountValue: 0,
  maxUses: undefined,
  validUntil: "",
  isActive: true,
};

export default function CouponsTab() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { toast, showSuccess, showError } = useToast();

  useEffect(() => { setPage(1); }, [search]);

  useEffect(() => {
    getAdminCoupons()
      .then(setCoupons)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load coupons.");
      })
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (c: AdminCoupon) => {
    setEditId(c.couponId);
    setForm({
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      maxUses: c.maxUses ?? undefined,
      validFrom: c.validFrom ?? "",
      validUntil: c.validUntil ?? "",
      minOrderAmount: c.minOrderAmount ?? undefined,
      isActive: c.isActive,
    });
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.code.trim()) { setFormError("Coupon code is required."); return; }
    if (!form.discountValue || form.discountValue <= 0) { setFormError("Discount value must be greater than 0."); return; }
    if (form.discountType === "Percentage" && form.discountValue > 100) { setFormError("Percentage discount cannot exceed 100%."); return; }

    setSubmitting(true);
    try {
      if (editId) {
        const updated = await updateAdminCoupon(editId, form);
        setCoupons((prev) => prev.map((c) => (c.couponId === editId ? updated : c)));
      } else {
        const created = await createAdminCoupon(form);
        setCoupons((prev) => [created, ...prev]);
      }
      setShowForm(false);
      showSuccess(editId ? "Coupon updated." : "Coupon created.");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to save coupon.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (couponId: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"? This cannot be undone.`)) return;
    try {
      await deleteAdminCoupon(couponId);
      setCoupons((prev) => prev.filter((c) => c.couponId !== couponId));
      showSuccess("Coupon deleted.");
    } catch (err) {
      showError(err instanceof ApiError ? err.message : "Failed to delete coupon.");
    }
  };

  const filtered = coupons.filter(c => c.code.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <LoadingScreen compact message="Loading coupons…" />;
  if (error) return <p className="adminPanel__error">{error}</p>;

  return (
    <>
      {toast && <p role="alert" aria-live="polite" className={`adminPanel__${toast.type}`}>{toast.message}</p>}
      <div className="adminPanel__toolbar">
        <input className="field__input adminPanel__search" type="search" placeholder="Search by coupon code…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type="button" className="button" onClick={openCreate}>
          + Add coupon
        </button>
      </div>

      <div className="adminPanel__infoBox">
        <h4 className="adminPanel__infoTitle">How Coupons Work</h4>
        <ul className="adminPanel__infoList">
          <li><strong>Percentage</strong> — Discounts by a % of the program price (e.g. 20 = 20% off). Max 100%.</li>
          <li><strong>Flat</strong> — Discounts by a fixed amount in the buyer's currency (e.g. 500 = ₹500 off / £500 off). The final price is never reduced below 1 unit of currency.</li>
          <li><strong>Max Uses</strong> — Leave blank for unlimited redemptions. Set a number to cap total uses across all users.</li>
          <li><strong>Expires At</strong> — After this date the coupon auto-deactivates. Leave blank for no expiry.</li>
          <li><strong>Status</strong> — Only <em>Active</em> coupons can be redeemed. Toggle via Edit.</li>
        </ul>
        <p className="adminPanel__infoNote">Users apply coupons at checkout. The discount is calculated and shown before payment. Each use increments the "Used" counter.</p>
      </div>

      {showForm && (
        <form className="adminForm" onSubmit={handleSubmit} noValidate>
          <h3 className="adminForm__title">{editId ? "Edit coupon" : "Create coupon"}</h3>
          {formError && <p className="adminPanel__error">{formError}</p>}

          <div className="adminForm__row">
            <label className="field">
              <span className="field__label">Coupon Code *</span>
              <span className="field__hint">The code users will enter at checkout, e.g. WELCOME20, DIWALI50</span>
              <input
                className="field__input"
                type="text"
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. WELCOME20"
                disabled={submitting}
              />
            </label>
            <label className="field">
              <span className="field__label">Discount Type</span>
              <span className="field__hint">Percentage = % off, Flat = fixed amount off in buyer's currency</span>
              <select
                className="field__input"
                value={form.discountType}
                onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value as "Percentage" | "Flat" }))}
                disabled={submitting}
              >
                <option value="Percentage">Percentage (%)</option>
                <option value="Flat">Flat Amount</option>
              </select>
            </label>
            <label className="field">
              <span className="field__label">{form.discountType === "Percentage" ? "Discount (%)" : "Discount Amount"}</span>
              <span className="field__hint">{form.discountType === "Percentage" ? "e.g. 20 = 20% off the program price" : "e.g. 500 = ₹500 / £500 / $500 off"}</span>
              <input
                className="field__input"
                type="number"
                min="0"
                max={form.discountType === "Percentage" ? 100 : undefined}
                value={form.discountValue}
                onChange={(e) => setForm((p) => ({ ...p, discountValue: Number(e.target.value) }))}
                placeholder={form.discountType === "Percentage" ? "e.g. 20" : "e.g. 500"}
                disabled={submitting}
              />
            </label>
          </div>

          <div className="adminForm__row">
            <label className="field">
              <span className="field__label">Max Uses</span>
              <span className="field__hint">Total redemptions allowed across all users. Leave blank for unlimited.</span>
              <input
                className="field__input"
                type="number"
                min="1"
                value={form.maxUses ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, maxUses: e.target.value ? Number(e.target.value) : undefined }))
                }
                placeholder="Unlimited"
                disabled={submitting}
              />
            </label>
            <label className="field">
              <span className="field__label">Expires At</span>
              <span className="field__hint">Coupon cannot be used after this date. Leave blank for no expiry.</span>
              <input
                className="field__input"
                type="datetime-local"
                value={form.validUntil ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, validUntil: e.target.value }))}
                disabled={submitting}
              />
            </label>
          </div>

          <div className="adminForm__actions">
            <button
              type="button"
              className="adminActionButton"
              onClick={() => setShowForm(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="button" disabled={submitting}>
              {submitting ? "Saving…" : editId ? "Save Changes" : "Create Coupon"}
            </button>
          </div>
        </form>
      )}

      {Math.ceil(filtered.length / PAGE_SIZE) > 1 && (
        <div className="adminPanel__pagination">
          <button type="button" className="adminActionButton" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
          <button type="button" className="adminActionButton" disabled={page >= Math.ceil(filtered.length / PAGE_SIZE)} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}

      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th scope="col">Code</th>
              <th scope="col">Type</th>
              <th scope="col">Value</th>
              <th scope="col">Used / Max</th>
              <th scope="col">Expires</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="adminTable__empty">No coupons.</td>
              </tr>
            ) : (
              filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((c) => (
                <tr key={c.couponId}>
                  <td><code>{c.code}</code></td>
                  <td>{c.discountType}</td>
                  <td>{c.discountType === "Percentage" ? `${c.discountValue}%` : c.discountValue.toFixed(2)}</td>
                  <td>{c.usedCount} / {c.maxUses ?? "∞"}</td>
                  <td>{c.validUntil ? new Date(c.validUntil).toLocaleDateString() : "Never"}</td>
                  <td>
                    <span className={`statusBadge statusBadge--${c.isActive ? "active" : "ended"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="adminTable__actions">
                    <button type="button" className="adminActionButton" onClick={() => openEdit(c)} aria-label={`Edit coupon ${c.code}`}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="adminActionButton adminActionButton--danger"
                      onClick={() => handleDelete(c.couponId, c.code)}
                      aria-label={`Delete coupon ${c.code}`}
                    >
                      Delete
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
