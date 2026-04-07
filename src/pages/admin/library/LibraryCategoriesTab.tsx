import { type FormEvent, useEffect, useState } from "react";
import {
  adminLibrary,
  type AdminLibraryCategoryDto,
} from "../../../api/adminLibrary";
import { ApiError } from "../../../api/client";

// Wellness Library domain is always this fixed ID (seeded in migration)
const WELLNESS_DOMAIN_ID = "22222222-0000-0000-0000-000000000001";

type FormState = { name: string; slug: string; cardImage: string; sortOrder: string };
const emptyForm: FormState = { name: "", slug: "", cardImage: "", sortOrder: "0" };

export default function LibraryCategoriesTab() {
  const [categories, setCategories] = useState<AdminLibraryCategoryDto[]>([]);
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
      .getCategories()
      .then(setCategories)
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
    if (!form.name.trim()) {
      setFormError("Please enter a category name.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || form.name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        cardImage: form.cardImage.trim() || null,
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (editingId) {
        await adminLibrary.updateCategory(editingId, payload);
        setFormSuccess("Category updated.");
      } else {
        await adminLibrary.createCategory({ domainId: WELLNESS_DOMAIN_ID, ...payload });
        setFormSuccess("Category created.");
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

  const startEdit = (c: AdminLibraryCategoryDto) => {
    setEditingId(c.categoryId);
    setForm({
      name: c.name,
      slug: c.slug,
      cardImage: "",
      sortOrder: String(c.sortOrder),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const onDelete = async (id: string) => {
    if (!confirm("Archive this category?")) return;
    setDeletingId(id);
    try {
      await adminLibrary.deleteCategory(id);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="adminPanel" role="tabpanel" aria-label="Library categories">
      <div className="adminPanel__header">
        <h2 className="adminPanel__title">Library Categories</h2>
        <p className="adminPanel__hint">Group your videos into browsable categories (e.g. Masterclasses, Mindfulness, Yoga).</p>
      </div>

      {loading && <p className="adminPanel__hint">Loading...</p>}
      {loadError && <p className="adminPanel__error">{loadError}</p>}
      {formSuccess && <p className="adminPanel__success">{formSuccess}</p>}
      {formError && <p className="adminPanel__error">{formError}</p>}

      <form className="form adminForm" onSubmit={onSubmit} noValidate>
        <label className="field">
          <span className="field__label">Category Name</span>
          <input
            className="field__input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Masterclasses, Yoga, Mindfulness"
            required
          />
        </label>
        <label className="field">
          <span className="field__label">URL Slug (auto-generated if empty)</span>
          <input
            className="field__input"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="e.g. masterclasses"
          />
        </label>
        <label className="field">
          <span className="field__label">Cover Image URL (optional)</span>
          <input
            className="field__input"
            value={form.cardImage}
            onChange={(e) => setForm({ ...form, cardImage: e.target.value })}
            placeholder="https://..."
          />
        </label>
        <label className="field">
          <span className="field__label">Display Order</span>
          <input
            className="field__input"
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
          />
        </label>
        <div className="adminForm__actions">
          <button type="submit" className="button" disabled={saving}>
            {editingId ? (saving ? "Saving..." : "Save Changes") : saving ? "Creating..." : "Create Category"}
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
              <th>Videos</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map((c) => (
                <tr key={c.categoryId}>
                  <td>{c.name}</td>
                  <td>{c.slug}</td>
                  <td>{c.videoCount}</td>
                  <td>{c.isActive ? "Yes" : "No"}</td>
                  <td>
                    <div className="adminActionGroup">
                      <button className="adminActionButton" onClick={() => startEdit(c)}>
                        Edit
                      </button>
                      <button
                        className="adminActionButton adminActionButton--danger"
                        disabled={deletingId === c.categoryId}
                        onClick={() => onDelete(c.categoryId)}
                      >
                        {deletingId === c.categoryId ? "Archiving..." : "Archive"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="adminTable__empty">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
