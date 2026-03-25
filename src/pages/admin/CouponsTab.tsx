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

const PAGE_SIZE = 15;

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
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to save coupon.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (couponId: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      await deleteAdminCoupon(couponId);
      setCoupons((prev) => prev.filter((c) => c.couponId !== couponId));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete coupon.");
    }
  };

  if (loading) return <p className="adminPanel__loading">Loading coupons…</p>;
  if (error) return <p className="adminPanel__error">{error}</p>;

  return (
    <>
      <div className="adminPanel__toolbar">
        <button type="button" className="button" onClick={openCreate}>
          + Add coupon
        </button>
      </div>

      {showForm && (
        <form className="adminForm" onSubmit={handleSubmit} noValidate>
          <h3 className="adminForm__title">{editId ? "Edit coupon" : "Create coupon"}</h3>
          {formError && <p className="adminPanel__error">{formError}</p>}

          <div className="adminForm__row">
            <label className="field">
              <span className="field__label">Code *</span>
              <input
                className="field__input"
                type="text"
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                disabled={submitting}
              />
            </label>
            <label className="field">
              <span className="field__label">Discount type</span>
              <select
                className="field__input"
                value={form.discountType}
                onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value as "Percentage" | "Flat" }))}
                disabled={submitting}
              >
                <option value="Percentage">Percentage</option>
                <option value="Flat">Flat</option>
              </select>
            </label>
            <label className="field">
              <span className="field__label">Value</span>
              <input
                className="field__input"
                type="number"
                min="0"
                value={form.discountValue}
                onChange={(e) => setForm((p) => ({ ...p, discountValue: Number(e.target.value) }))}
                disabled={submitting}
              />
            </label>
          </div>

          <div className="adminForm__row">
            <label className="field">
              <span className="field__label">Max uses (blank = unlimited)</span>
              <input
                className="field__input"
                type="number"
                min="1"
                value={form.maxUses ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, maxUses: e.target.value ? Number(e.target.value) : undefined }))
                }
                disabled={submitting}
              />
            </label>
            <label className="field">
              <span className="field__label">Expires at</span>
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
              {submitting ? "Saving…" : editId ? "Update" : "Create"}
            </button>
          </div>
        </form>
      )}

      {Math.ceil(coupons.length / PAGE_SIZE) > 1 && (
        <div className="adminPanel__pagination">
          <button type="button" className="adminActionButton" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>Page {page} of {Math.ceil(coupons.length / PAGE_SIZE)}</span>
          <button type="button" className="adminActionButton" disabled={page >= Math.ceil(coupons.length / PAGE_SIZE)} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}

      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Used / Max</th>
              <th>Expires</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="adminTable__empty">No coupons.</td>
              </tr>
            ) : (
              coupons.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((c) => (
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
                    <button type="button" className="adminActionButton" onClick={() => openEdit(c)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="adminActionButton adminActionButton--danger"
                      onClick={() => handleDelete(c.couponId, c.code)}
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
