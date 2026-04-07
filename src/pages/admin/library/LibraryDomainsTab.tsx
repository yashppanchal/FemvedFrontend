import { type FormEvent, useEffect, useState } from "react";
import { adminLibrary, type AdminLibraryDomainDto } from "../../../api/adminLibrary";
import { ApiError } from "../../../api/client";

type FormState = { name: string; slug: string; sortOrder: string };
const emptyForm: FormState = { name: "", slug: "", sortOrder: "0" };

export default function LibraryDomainsTab() {
  const [domains, setDomains] = useState<AdminLibraryDomainDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminLibrary
      .getDomains()
      .then(setDomains)
      .catch((err) =>
        setLoadError(err instanceof ApiError ? err.message : "Failed to load domains."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (editingId) {
        await adminLibrary.updateDomain(editingId, payload);
        setFormSuccess("Domain updated.");
      } else {
        await adminLibrary.createDomain(payload);
        setFormSuccess("Domain created.");
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (d: AdminLibraryDomainDto) => {
    setEditingId(d.domainId);
    setForm({ name: d.name, slug: d.slug, sortOrder: String(d.sortOrder) });
    setFormError(null);
    setFormSuccess(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const onDelete = async (id: string) => {
    if (!confirm("Archive this domain?")) return;
    setDeletingId(id);
    try {
      await adminLibrary.deleteDomain(id);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="adminPanel" role="tabpanel" aria-label="Library domains">
      <div className="adminPanel__header">
        <h2 className="adminPanel__title">Library Domains</h2>
        <p className="adminPanel__hint">Top-level domains for the Wellness Library.</p>
      </div>

      {loading && <p className="adminPanel__hint">Loading...</p>}
      {loadError && <p className="adminPanel__error">{loadError}</p>}
      {formSuccess && <p className="adminPanel__success">{formSuccess}</p>}
      {formError && <p className="adminPanel__error">{formError}</p>}

      <form className="form adminForm" onSubmit={onSubmit} noValidate>
        <label className="field">
          <span className="field__label">Name</span>
          <input
            className="field__input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label className="field">
          <span className="field__label">Slug</span>
          <input
            className="field__input"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            required
          />
        </label>
        <label className="field">
          <span className="field__label">Sort order</span>
          <input
            className="field__input"
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
          />
        </label>
        <div className="adminForm__actions">
          <button type="submit" className="button" disabled={saving}>
            {editingId ? (saving ? "Saving…" : "Save Changes") : saving ? "Creating…" : "Create Domain"}
          </button>
          {editingId && (
            <button type="button" className="adminActionButton" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Categories</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {domains.length > 0 ? (
              domains.map((d) => (
                <tr key={d.domainId}>
                  <td>{d.name}</td>
                  <td>{d.slug}</td>
                  <td>{d.categoryCount}</td>
                  <td>{d.isActive ? "Yes" : "No"}</td>
                  <td>
                    <div className="adminActionGroup">
                      <button className="adminActionButton" onClick={() => startEdit(d)}>
                        Edit
                      </button>
                      <button
                        className="adminActionButton adminActionButton--danger"
                        disabled={deletingId === d.domainId}
                        onClick={() => onDelete(d.domainId)}
                      >
                        {deletingId === d.domainId ? "Archiving..." : "Archive"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="adminTable__empty">
                  No domains yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
