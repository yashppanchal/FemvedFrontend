import { type FormEvent, useEffect, useState } from "react";
import {
  getAdminExperts,
  activateAdminExpert,
  deactivateAdminExpert,
  deleteAdminExpert,
  adminCreateExpertProfile,
  type AdminExpert,
  type AdminCreateExpertProfileRequest,
} from "../../api/admin";
import { ApiError } from "../../api/client";

// ── Expert edit form shape ────────────────────────────────────────────────────

type EditForm = {
  displayName: string;
  title: string;
  bio: string;
  gridDescription: string;
  specialisations: string;
  credentials: string;
  yearsExperience: string;
  locationCountry: string;
  profileImageUrl: string;
  gridImageUrl: string;
};

function expertToForm(e: AdminExpert): EditForm {
  return {
    displayName: e.displayName ?? "",
    title: e.title ?? "",
    bio: "",
    gridDescription: "",
    specialisations: "",
    credentials: "",
    yearsExperience: "",
    locationCountry: e.locationCountry ?? "",
    profileImageUrl: "",
    gridImageUrl: "",
  };
}

function formToRequest(f: EditForm): AdminCreateExpertProfileRequest {
  const req: AdminCreateExpertProfileRequest = {};
  if (f.displayName.trim()) req.displayName = f.displayName.trim();
  if (f.title.trim()) req.title = f.title.trim();
  if (f.bio.trim()) req.bio = f.bio.trim();
  if (f.gridDescription.trim()) req.gridDescription = f.gridDescription.trim();
  if (f.locationCountry.trim()) req.locationCountry = f.locationCountry.trim();
  if (f.profileImageUrl.trim()) req.profileImageUrl = f.profileImageUrl.trim();
  if (f.gridImageUrl.trim()) req.gridImageUrl = f.gridImageUrl.trim();
  const specs = f.specialisations.split(",").map((s) => s.trim()).filter(Boolean);
  if (specs.length) req.specialisations = specs;
  const creds = f.credentials.split(",").map((s) => s.trim()).filter(Boolean);
  if (creds.length) req.credentials = creds;
  if (f.yearsExperience.trim()) {
    const n = parseInt(f.yearsExperience, 10);
    if (!isNaN(n) && n > 0) req.yearsExperience = n;
  }
  return req;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ExpertsTab() {
  const [experts, setExperts] = useState<AdminExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Edit panel state
  const [editingExpert, setEditingExpert] = useState<AdminExpert | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  useEffect(() => {
    getAdminExperts()
      .then(setExperts)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load experts.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggleActive = async (expert: AdminExpert) => {
    try {
      const updated = expert.isActive
        ? await deactivateAdminExpert(expert.expertId)
        : await activateAdminExpert(expert.expertId);
      setExperts((prev) => prev.map((e) => (e.expertId === expert.expertId ? updated : e)));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to update expert.");
    }
  };

  const handleDelete = async (expertId: string, name: string) => {
    if (!confirm(`Delete expert profile for ${name}? This cannot be undone.`)) return;
    try {
      await deleteAdminExpert(expertId);
      setExperts((prev) => prev.filter((e) => e.expertId !== expertId));
      if (editingExpert?.expertId === expertId) setEditingExpert(null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to delete expert.");
    }
  };

  const openEdit = (expert: AdminExpert) => {
    setEditingExpert(expert);
    setEditForm(expertToForm(expert));
    setEditError(null);
    setEditSuccess(null);
  };

  const closeEdit = () => {
    setEditingExpert(null);
    setEditForm(null);
    setEditError(null);
    setEditSuccess(null);
  };

  const setF =
    (key: keyof EditForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setEditForm((prev) => prev ? { ...prev, [key]: e.target.value } : prev);

  const handleEditSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!editingExpert || !editForm) return;
    const data = formToRequest(editForm);
    if (Object.keys(data).length === 0) {
      setEditError("Please fill in at least one field to update.");
      return;
    }
    setEditError(null);
    setEditSuccess(null);
    setSaving(true);
    try {
      await adminCreateExpertProfile(editingExpert.userId, data);
      // Optimistically refresh display name / title / location if changed
      setExperts((prev) =>
        prev.map((e) =>
          e.expertId === editingExpert.expertId
            ? {
                ...e,
                displayName: data.displayName ?? e.displayName,
                title: data.title ?? e.title,
                locationCountry: data.locationCountry ?? e.locationCountry,
              }
            : e,
        ),
      );
      setEditSuccess("Expert profile updated.");
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = experts.filter(
    (e) =>
      (e.displayName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (e.email ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <p className="adminPanel__loading">Loading experts…</p>;
  if (error) return <p className="adminPanel__error">{error}</p>;

  return (
    <>
      <div className="adminPanel__toolbar">
        <input
          className="field__input adminPanel__search"
          type="search"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="adminPanel__count">{filtered.length} experts</span>
      </div>

      {/* ── Edit panel ──────────────────────────────────────────────────── */}
      {editingExpert && editForm && (
        <form className="adminForm adminForm--expertPromotion" onSubmit={handleEditSubmit} noValidate>
          <div className="adminForm__promotionHeader">
            <div>
              <h3 className="adminForm__title">Edit profile — {editingExpert.displayName || editingExpert.email}</h3>
              <p className="adminForm__subtitle">Only filled fields will be updated. Leave blank to keep existing values.</p>
            </div>
            <button type="button" className="adminModal__close" onClick={closeEdit} disabled={saving}>✕</button>
          </div>

          {editError && <p className="adminPanel__error">{editError}</p>}
          {editSuccess && <p className="adminPanel__success">{editSuccess}</p>}

          <div className="adminForm__row adminForm__row--two">
            <label className="field">
              <span className="field__label">Display name</span>
              <input className="field__input" type="text" value={editForm.displayName} onChange={setF("displayName")} disabled={saving} placeholder="e.g. Dr. Priya Sharma" />
            </label>
            <label className="field">
              <span className="field__label">Title / Specialty</span>
              <input className="field__input" type="text" value={editForm.title} onChange={setF("title")} disabled={saving} placeholder="e.g. Ayurvedic Practitioner" />
            </label>
          </div>

          <div className="adminForm__row adminForm__row--two">
            <label className="field">
              <span className="field__label">Location (country)</span>
              <input className="field__input" type="text" value={editForm.locationCountry} onChange={setF("locationCountry")} disabled={saving} placeholder="e.g. India" />
            </label>
            <label className="field">
              <span className="field__label">Years of experience</span>
              <input className="field__input" type="number" min="1" value={editForm.yearsExperience} onChange={setF("yearsExperience")} disabled={saving} placeholder="e.g. 8" />
            </label>
          </div>

          <div className="adminForm__row adminForm__row--two">
            <label className="field">
              <span className="field__label">Specialisations (comma-separated)</span>
              <input className="field__input" type="text" value={editForm.specialisations} onChange={setF("specialisations")} disabled={saving} placeholder="e.g. PCOS, Hormonal Health" />
            </label>
            <label className="field">
              <span className="field__label">Credentials (comma-separated)</span>
              <input className="field__input" type="text" value={editForm.credentials} onChange={setF("credentials")} disabled={saving} placeholder="e.g. BAMS, MD Ayurveda" />
            </label>
          </div>

          <label className="field">
            <span className="field__label">Bio</span>
            <textarea className="field__input adminForm__textarea" value={editForm.bio} onChange={setF("bio")} disabled={saving} placeholder="Professional bio shown on the expert's public profile…" />
          </label>

          <label className="field">
            <span className="field__label">Short card description</span>
            <textarea className="field__input adminForm__textarea adminForm__textarea--sm" value={editForm.gridDescription} onChange={setF("gridDescription")} disabled={saving} placeholder="1–2 sentences shown on browse cards." />
          </label>

          <div className="adminForm__row adminForm__row--two">
            <label className="field">
              <span className="field__label">Profile image URL</span>
              <input className="field__input" type="url" value={editForm.profileImageUrl} onChange={setF("profileImageUrl")} disabled={saving} />
            </label>
            <label className="field">
              <span className="field__label">Grid / card image URL</span>
              <input className="field__input" type="url" value={editForm.gridImageUrl} onChange={setF("gridImageUrl")} disabled={saving} />
            </label>
          </div>

          <div className="adminForm__actions">
            <button type="button" className="adminActionButton" onClick={closeEdit} disabled={saving}>Cancel</button>
            <button type="submit" className="button" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
          </div>
        </form>
      )}

      {/* ── Experts table ────────────────────────────────────────────────── */}
      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Title</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="adminTable__empty">No experts found.</td>
              </tr>
            ) : (
              filtered.map((e) => (
                <tr key={e.expertId} className={editingExpert?.expertId === e.expertId ? "adminTable__row--highlighted" : ""}>
                  <td>{e.displayName || "—"}</td>
                  <td>{e.email}</td>
                  <td>{e.title || "—"}</td>
                  <td>{e.locationCountry || "—"}</td>
                  <td>
                    <span className={`statusBadge statusBadge--${e.isActive ? "active" : "ended"}`}>
                      {e.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="adminTable__actions">
                    <button
                      type="button"
                      className="adminActionButton"
                      onClick={() => openEdit(e)}
                    >
                      Edit profile
                    </button>
                    <button
                      type="button"
                      className="adminActionButton"
                      onClick={() => handleToggleActive(e)}
                    >
                      {e.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      className="adminActionButton adminActionButton--danger"
                      onClick={() => handleDelete(e.expertId, e.displayName)}
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
