import { type FormEvent, useEffect, useState } from "react";
import {
  adminLibrary,
  type AdminFilterTypeDto,
  type AdminLibraryDomainDto,
} from "../../../api/adminLibrary";
import { ApiError } from "../../../api/client";

type FormState = {
  domainId: string;
  name: string;
  filterKey: string;
  filterTarget: string;
  sortOrder: string;
};
const emptyForm: FormState = {
  domainId: "",
  name: "",
  filterKey: "",
  filterTarget: "VIDEO_TYPE",
  sortOrder: "0",
};

const TARGETS = ["VIDEO_TYPE", "CATEGORY"] as const;

export default function LibraryFiltersTab() {
  const [filters, setFilters] = useState<AdminFilterTypeDto[]>([]);
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
    Promise.all([adminLibrary.getFilterTypes(), adminLibrary.getDomains()])
      .then(([f, d]) => {
        setFilters(f);
        setDomains(d);
      })
      .catch((err) =>
        setLoadError(err instanceof ApiError ? err.message : "Failed to load."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    if (!form.domainId) {
      setFormError("Please select a domain.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        filterKey: form.filterKey.trim(),
        filterTarget: form.filterTarget,
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (editingId) {
        await adminLibrary.updateFilterType(editingId, payload);
        setFormSuccess("Filter updated.");
      } else {
        await adminLibrary.createFilterType({ domainId: form.domainId, ...payload });
        setFormSuccess("Filter created.");
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

  const startEdit = (f: AdminFilterTypeDto) => {
    setEditingId(f.filterTypeId);
    setForm({
      domainId: f.domainId,
      name: f.name,
      filterKey: f.filterKey,
      filterTarget: f.filterTarget,
      sortOrder: String(f.sortOrder),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const onDelete = async (id: string) => {
    if (!confirm("Remove this filter?")) return;
    setDeletingId(id);
    try {
      await adminLibrary.deleteFilterType(id);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="adminPanel" role="tabpanel" aria-label="Library filter types">
      <div className="adminPanel__header">
        <h2 className="adminPanel__title">Library Filter Types</h2>
        <p className="adminPanel__hint">Dynamic filter tabs shown on the catalog page.</p>
      </div>

      {loading && <p className="adminPanel__hint">Loading...</p>}
      {loadError && <p className="adminPanel__error">{loadError}</p>}
      {formSuccess && <p className="adminPanel__success">{formSuccess}</p>}
      {formError && <p className="adminPanel__error">{formError}</p>}

      <form className="form adminForm" onSubmit={onSubmit} noValidate>
        <label className="field">
          <span className="field__label">Domain</span>
          <select
            className="field__input"
            value={form.domainId}
            onChange={(e) => setForm({ ...form, domainId: e.target.value })}
            disabled={!!editingId}
            required
          >
            <option value="">Select domain…</option>
            {domains.map((d) => (
              <option key={d.domainId} value={d.domainId}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
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
          <span className="field__label">Filter key</span>
          <input
            className="field__input"
            value={form.filterKey}
            onChange={(e) => setForm({ ...form, filterKey: e.target.value })}
            placeholder="e.g. MASTERCLASS or category slug"
            required
          />
        </label>
        <label className="field">
          <span className="field__label">Target</span>
          <select
            className="field__input"
            value={form.filterTarget}
            onChange={(e) => setForm({ ...form, filterTarget: e.target.value })}
          >
            {TARGETS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
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
            {editingId ? (saving ? "Saving…" : "Save Changes") : saving ? "Creating…" : "Create Filter"}
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
              <th>Key</th>
              <th>Target</th>
              <th>Sort</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filters.length > 0 ? (
              filters.map((f) => (
                <tr key={f.filterTypeId}>
                  <td>{f.name}</td>
                  <td>{f.filterKey}</td>
                  <td>{f.filterTarget}</td>
                  <td>{f.sortOrder}</td>
                  <td>{f.isActive ? "Yes" : "No"}</td>
                  <td>
                    <div className="adminActionGroup">
                      <button className="adminActionButton" onClick={() => startEdit(f)}>
                        Edit
                      </button>
                      <button
                        className="adminActionButton adminActionButton--danger"
                        disabled={deletingId === f.filterTypeId}
                        onClick={() => onDelete(f.filterTypeId)}
                      >
                        {deletingId === f.filterTypeId ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="adminTable__empty">
                  No filters yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
