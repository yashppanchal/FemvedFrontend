import { type FormEvent, useEffect, useState } from "react";
import { useEscapeKey } from "../../useEscapeKey";
import {
  getAdminExperts,
  activateAdminExpert,
  deactivateAdminExpert,
  deleteAdminExpert,
  adminCreateExpertProfile,
  adminChangeUserEmail,
  getAdminExpertPrograms,
  getAdminExpertEnrollments,
  adminStartEnrollment,
  adminApproveStartDate,
  adminDeclineStartDate,
  adminPauseEnrollment,
  adminResumeEnrollment,
  adminEndEnrollment,
  type AdminExpert,
  type AdminCreateExpertProfileRequest,
  type AdminExpertProgram,
  type AdminEnrollment,
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
  newEmail: string;
};

function expertToForm(e: AdminExpert): EditForm {
  return {
    displayName: e.displayName ?? "",
    title: e.title ?? "",
    bio: e.bio ?? "",
    gridDescription: e.gridDescription ?? "",
    specialisations: e.specialisations?.join(", ") ?? "",
    credentials: e.credentials?.join(", ") ?? "",
    yearsExperience: e.yearsExperience != null ? String(e.yearsExperience) : "",
    locationCountry: e.locationCountry ?? "",
    profileImageUrl: e.profileImageUrl ?? "",
    gridImageUrl: e.gridImageUrl ?? "",
    newEmail: "",
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

import { CloudinaryImageUrlField } from "../../components/CloudinaryImageUrlField";
import { PAGE_SIZE } from "../../constants";
import { useToast } from "../../useToast";
import { getStatusBadgeClass, formatStatus } from "../../statusBadge";
import { formatDate, todayISO } from "../../dateUtils";

// ── Component ─────────────────────────────────────────────────────────────────

export default function ExpertsTab() {
  const [experts, setExperts] = useState<AdminExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { toast, showError } = useToast();

  // Reset page on search change
  useEffect(() => { setPage(1); }, [search]);

  // Edit panel state
  const [editingExpert, setEditingExpert] = useState<AdminExpert | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  // Profile detail view
  const [profileExpertId, setProfileExpertId] = useState<string | null>(null);

  // Expanded expert programs/enrollments
  const [expandedExpertId, setExpandedExpertId] = useState<string | null>(null);
  const [expertPrograms, setExpertPrograms] = useState<AdminExpertProgram[]>([]);
  const [expertEnrollments, setExpertEnrollments] = useState<AdminEnrollment[]>([]);
  const [expandedLoading, setExpandedLoading] = useState(false);
  const [expandedError, setExpandedError] = useState<string | null>(null);
  const [enrollmentActionError, setEnrollmentActionError] = useState<string | null>(null);

  // Start date picker modal
  const [startPickerId, setStartPickerId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(todayISO());
  const [startingId, setStartingId] = useState<string | null>(null);

  useEscapeKey(() => setStartPickerId(null), !!startPickerId);

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
      showError(err instanceof ApiError ? err.message : "Failed to update expert.");
    }
  };

  const handleDelete = async (expertId: string, name: string) => {
    if (!confirm(`Delete expert profile for ${name}? This cannot be undone.`)) return;
    try {
      await deleteAdminExpert(expertId);
      setExperts((prev) => prev.filter((e) => e.expertId !== expertId));
      if (editingExpert?.expertId === expertId) setEditingExpert(null);
      if (expandedExpertId === expertId) setExpandedExpertId(null);
    } catch (err) {
      showError(err instanceof ApiError ? err.message : "Failed to delete expert.");
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
    const hasProfileData = Object.keys(data).length > 0;
    const hasEmailChange = editForm.newEmail.trim().length > 0;

    if (!hasProfileData && !hasEmailChange) {
      setEditError("Please fill in at least one field to update.");
      return;
    }

    setEditError(null);
    setEditSuccess(null);
    setSaving(true);
    try {
      if (hasProfileData) {
        await adminCreateExpertProfile(editingExpert.userId, data);
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
      }

      if (hasEmailChange) {
        await adminChangeUserEmail(editingExpert.userId, editForm.newEmail.trim());
        setExperts((prev) =>
          prev.map((e) =>
            e.expertId === editingExpert.expertId
              ? { ...e, userEmail: editForm.newEmail.trim() }
              : e,
          ),
        );
      }

      setEditSuccess("Expert updated successfully.");
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : "Failed to update expert.");
    } finally {
      setSaving(false);
    }
  };

  // ── Expand expert to show programs + enrollments ──────────────────────────
  const toggleExpand = async (expertId: string) => {
    if (expandedExpertId === expertId) {
      setExpandedExpertId(null);
      return;
    }
    setExpandedExpertId(expertId);
    setExpandedLoading(true);
    setExpandedError(null);
    setExpertPrograms([]);
    setExpertEnrollments([]);
    setEnrollmentActionError(null);
    try {
      const [programs, enrollments] = await Promise.all([
        getAdminExpertPrograms(expertId),
        getAdminExpertEnrollments(expertId),
      ]);
      setExpertPrograms(programs);
      setExpertEnrollments(enrollments);
    } catch (err) {
      setExpandedError(err instanceof ApiError ? err.message : "Failed to load details.");
    } finally {
      setExpandedLoading(false);
    }
  };

  const updateEnrollmentStatus = (id: string, accessStatus: string) =>
    setExpertEnrollments((prev) =>
      prev.map((e) => (e.accessId === id ? { ...e, accessStatus } : e))
    );

  const runEnrollmentAction = async (id: string, fn: () => Promise<void>, newStatus: string) => {
    setEnrollmentActionError(null);
    try {
      await fn();
      updateEnrollmentStatus(id, newStatus);
    } catch (err) {
      setEnrollmentActionError(err instanceof ApiError ? err.message : "Action failed.");
    }
  };

  const handleStartConfirm = async () => {
    if (!startPickerId) return;
    setStartingId(startPickerId);
    setEnrollmentActionError(null);
    try {
      await adminStartEnrollment(startPickerId, startDate !== todayISO() ? startDate : undefined);
      if (startDate === todayISO()) {
        updateEnrollmentStatus(startPickerId, "Active");
      } else {
        setExpertEnrollments((prev) =>
          prev.map((e) => e.accessId === startPickerId ? { ...e, scheduledStartAt: startDate } : e)
        );
      }
    } catch (err) {
      setEnrollmentActionError(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setStartingId(null);
      setStartPickerId(null);
      setStartDate(todayISO());
    }
  };

  const filtered = experts.filter(
    (e) =>
      (e.displayName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (e.userEmail ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <p className="adminPanel__loading">Loading experts…</p>;
  if (error) return <p className="adminPanel__error">{error}</p>;

  return (
    <>
      {toast && <p role="alert" aria-live="polite" className={`adminPanel__${toast.type}`}>{toast.message}</p>}
      <div className="adminPanel__toolbar">
        <input
          className="field__input adminPanel__search"
          type="search"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="adminPanel__count">{filtered.length} experts</span>
        {Math.ceil(filtered.length / PAGE_SIZE) > 1 && (
          <div className="adminPanel__pagination">
            <button type="button" className="adminActionButton" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            <button type="button" className="adminActionButton" disabled={page >= Math.ceil(filtered.length / PAGE_SIZE)} onClick={() => setPage((p) => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {/* ── Edit panel ──────────────────────────────────────────────────── */}
      {editingExpert && editForm && (
        <form className="adminForm adminForm--expertPromotion" onSubmit={handleEditSubmit} noValidate>
          <div className="adminForm__promotionHeader">
            <div>
              <h3 className="adminForm__title">Edit profile — {editingExpert.displayName || editingExpert.userEmail}</h3>
              <p className="adminForm__subtitle">Only filled fields will be updated. Leave blank to keep existing values.</p>
            </div>
            <button type="button" className="adminModal__close" onClick={closeEdit} disabled={saving} aria-label="Close">✕</button>
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
            <textarea className="field__input adminForm__textarea" value={editForm.bio} onChange={setF("bio")} disabled={saving} placeholder="Professional bio…" />
          </label>

          <label className="field">
            <span className="field__label">Short card description</span>
            <textarea className="field__input adminForm__textarea adminForm__textarea--sm" value={editForm.gridDescription} onChange={setF("gridDescription")} disabled={saving} placeholder="1–2 sentences shown on browse cards." />
          </label>

          <div className="adminForm__row adminForm__row--two">
            <CloudinaryImageUrlField
              label="Profile image URL"
              hint="Upload an image or paste a URL. Used for the expert’s profile photo."
              value={editForm.profileImageUrl}
              onUrlChange={(url) =>
                setEditForm((prev) => (prev ? { ...prev, profileImageUrl: url } : prev))
              }
              disabled={saving}
              uploadFolder="expert-image"
            />
            <label className="field">
              <span className="field__label">Grid / card image URL</span>
              <input className="field__input" type="url" value={editForm.gridImageUrl} onChange={setF("gridImageUrl")} disabled={saving} />
            </label>
          </div>

          <label className="field">
            <span className="field__label">Change email address</span>
            <input className="field__input" type="email" value={editForm.newEmail} onChange={setF("newEmail")} disabled={saving} placeholder="Leave blank to keep current email" />
          </label>

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
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Title</th>
              <th scope="col">Location</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="adminTable__empty">No experts found.</td>
              </tr>
            ) : (
              filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).flatMap((e) => {
                const rows = [
                  <tr key={e.expertId} className={editingExpert?.expertId === e.expertId ? "adminTable__row--highlighted" : ""}>
                    <td>{e.displayName || "—"}</td>
                    <td>{e.userEmail}</td>
                    <td>{e.title || "—"}</td>
                    <td>{e.locationCountry || "—"}</td>
                    <td>
                      <span className={`statusBadge statusBadge--${e.isActive ? "active" : "ended"}`}>
                        {e.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="adminTable__actions">
                      <button type="button" className="adminActionButton" onClick={() => setProfileExpertId(profileExpertId === e.expertId ? null : e.expertId)} aria-label={`${profileExpertId === e.expertId ? "Hide profile for" : "View profile for"} ${e.displayName || e.userEmail}`}>
                        {profileExpertId === e.expertId ? "Hide profile" : "View profile"}
                      </button>
                      <button type="button" className="adminActionButton" onClick={() => toggleExpand(e.expertId)} aria-label={`${expandedExpertId === e.expertId ? "Hide programs for" : "View programs for"} ${e.displayName || e.userEmail}`}>
                        {expandedExpertId === e.expertId ? "Hide details" : "View programs"}
                      </button>
                      <button type="button" className="adminActionButton" onClick={() => openEdit(e)} aria-label={`Edit profile for ${e.displayName || e.userEmail}`}>
                        Edit profile
                      </button>
                      <button type="button" className="adminActionButton" onClick={() => handleToggleActive(e)} aria-label={`${e.isActive ? "Deactivate" : "Activate"} ${e.displayName || e.userEmail}`}>
                        {e.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button type="button" className="adminActionButton adminActionButton--danger" onClick={() => handleDelete(e.expertId, e.displayName)} aria-label={`Delete ${e.displayName || e.userEmail}`}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ];

                if (profileExpertId === e.expertId) {
                  rows.push(
                    <tr key={`${e.expertId}-profile`}>
                      <td colSpan={6} className="adminTable__expandedRow">
                        <div className="adminExpandedSection">
                          <h4 className="adminExpandedSection__title">Expert Profile Details</h4>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem 2rem", fontSize: 14 }}>
                            <div><strong>Display Name:</strong> {e.displayName || "—"}</div>
                            <div><strong>Title:</strong> {e.title || "—"}</div>
                            <div><strong>Email:</strong> {e.userEmail}</div>
                            <div><strong>Location:</strong> {e.locationCountry || "—"}</div>
                            <div><strong>Years Experience:</strong> {e.yearsExperience ?? "—"}</div>
                            <div><strong>Commission Rate:</strong> {e.commissionRate}%</div>
                            <div><strong>Active:</strong> {e.isActive ? "Yes" : "No"}</div>
                            <div><strong>Created:</strong> {formatDate(e.createdAt)}</div>
                          </div>
                          {e.bio && (
                            <div style={{ marginTop: "0.75rem" }}><strong>Bio:</strong><p style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>{e.bio}</p></div>
                          )}
                          {e.gridDescription && (
                            <div style={{ marginTop: "0.5rem" }}><strong>Card Description:</strong><p style={{ marginTop: 4 }}>{e.gridDescription}</p></div>
                          )}
                          {e.detailedDescription && (
                            <div style={{ marginTop: "0.5rem" }}><strong>Detailed Description:</strong><p style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>{e.detailedDescription}</p></div>
                          )}
                          {e.specialisations && e.specialisations.length > 0 && (
                            <div style={{ marginTop: "0.5rem" }}><strong>Specialisations:</strong> {e.specialisations.join(", ")}</div>
                          )}
                          {e.credentials && e.credentials.length > 0 && (
                            <div style={{ marginTop: "0.5rem" }}><strong>Credentials:</strong> {e.credentials.join(", ")}</div>
                          )}
                          {(e.profileImageUrl || e.gridImageUrl) && (
                            <div style={{ marginTop: "0.75rem", display: "flex", gap: "1rem" }}>
                              {e.profileImageUrl && (
                                <div>
                                  <strong>Profile Image:</strong>
                                  <img src={e.profileImageUrl} alt="Profile" style={{ display: "block", maxWidth: 120, maxHeight: 120, marginTop: 4, borderRadius: 8 }} />
                                </div>
                              )}
                              {e.gridImageUrl && (
                                <div>
                                  <strong>Grid Image:</strong>
                                  <img src={e.gridImageUrl} alt="Grid" style={{ display: "block", maxWidth: 120, maxHeight: 120, marginTop: 4, borderRadius: 8 }} />
                                </div>
                              )}
                            </div>
                          )}
                          {!e.bio && !e.specialisations?.length && !e.credentials?.length && !e.profileImageUrl && (
                            <p className="adminPanel__empty" style={{ marginTop: "0.75rem" }}>
                              Profile is incomplete — bio, specialisations, credentials, and images are not set. Use "Edit profile" to add them.
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }

                if (expandedExpertId === e.expertId) {
                  rows.push(
                    <tr key={`${e.expertId}-expand`}>
                      <td colSpan={6} className="adminTable__expandedRow">
                        {expandedLoading ? (
                          <p className="adminPanel__loading">Loading programs…</p>
                        ) : expandedError ? (
                          <p className="adminPanel__error">{expandedError}</p>
                        ) : (
                          <div className="adminExpandedSection">
                            <h4 className="adminExpandedSection__title">Programs ({expertPrograms.length})</h4>
                            {expertPrograms.length === 0 ? (
                              <p className="adminPanel__empty">No programs yet.</p>
                            ) : (
                              <table className="adminTable adminTable--nested">
                                <thead>
                                  <tr>
                                    <th scope="col">Program</th>
                                    <th scope="col">Total Enrolled</th>
                                    <th scope="col">Active</th>
                                    <th scope="col">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {expertPrograms.map((p) => (
                                    <tr key={p.programId}>
                                      <td>{p.programName}</td>
                                      <td>{p.totalEnrollments}</td>
                                      <td>{p.activeEnrollments}</td>
                                      <td>
                                        <span className={`statusBadge statusBadge--${getStatusBadgeClass(p.status)}`}>
                                          {formatStatus(p.status)}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}

                            <h4 className="adminExpandedSection__title" style={{ marginTop: "1rem" }}>
                              Enrollments ({expertEnrollments.length})
                            </h4>
                            {enrollmentActionError && <p className="adminPanel__error">{enrollmentActionError}</p>}
                            {expertEnrollments.length === 0 ? (
                              <p className="adminPanel__empty">No enrollments yet.</p>
                            ) : (
                              <table className="adminTable adminTable--nested">
                                <thead>
                                  <tr>
                                    <th scope="col">Client</th>
                                    <th scope="col">Program</th>
                                    <th scope="col">Duration</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Start / End Date</th>
                                    <th scope="col">Requested Start</th>
                                    <th scope="col">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {expertEnrollments.map((enr) => (
                                    <tr key={enr.accessId}>
                                      <td>
                                        <div>{enr.userFirstName} {enr.userLastName}</div>
                                        <div className="adminTable__sub">{enr.userEmail}</div>
                                      </td>
                                      <td>{enr.programName}</td>
                                      <td>{enr.durationLabel}</td>
                                      <td>
                                        <span className={`statusBadge statusBadge--${getStatusBadgeClass(enr.scheduledStartAt && enr.accessStatus === "NotStarted" ? "Scheduled" : enr.accessStatus)}`}>
                                          {enr.scheduledStartAt && enr.accessStatus === "NotStarted" ? "Scheduled" : formatStatus(enr.accessStatus)}
                                        </span>
                                      </td>
                                      <td>
                                        {enr.startedAt ? (
                                          <>
                                            <div>{formatDate(enr.startedAt)}</div>
                                            {enr.endDate && <div className="adminTable__sub">Ends: {formatDate(enr.endDate)}</div>}
                                          </>
                                        ) : enr.scheduledStartAt ? (
                                          <div>{formatDate(enr.scheduledStartAt)}</div>
                                        ) : "—"}
                                      </td>
                                      <td>
                                        {enr.requestedStartDate ? (
                                          <>
                                            <div>{formatDate(enr.requestedStartDate)}</div>
                                            {enr.startRequestStatus && <div className="adminTable__sub">{enr.startRequestStatus}</div>}
                                          </>
                                        ) : "—"}
                                      </td>
                                      <td className="adminTable__actions">
                                        {enr.accessStatus === "NotStarted" && (
                                          <button type="button" className="adminActionButton" onClick={() => { setStartPickerId(enr.accessId); setStartDate(todayISO()); }} aria-label={`${enr.scheduledStartAt ? "Reschedule" : "Start"} enrollment for ${enr.userFirstName} ${enr.userLastName}`}>
                                            {enr.scheduledStartAt ? "Reschedule" : "Start"}
                                          </button>
                                        )}
                                        {enr.startRequestStatus === "Pending" && (
                                          <>
                                            <button type="button" className="adminActionButton" onClick={() => runEnrollmentAction(enr.accessId, () => adminApproveStartDate(enr.accessId), enr.accessStatus)} aria-label={`Approve start date for ${enr.userFirstName} ${enr.userLastName}`}>
                                              Approve
                                            </button>
                                            <button type="button" className="adminActionButton adminActionButton--danger" onClick={() => runEnrollmentAction(enr.accessId, () => adminDeclineStartDate(enr.accessId), enr.accessStatus)} aria-label={`Decline start date for ${enr.userFirstName} ${enr.userLastName}`}>
                                              Decline
                                            </button>
                                          </>
                                        )}
                                        {enr.accessStatus === "Active" && (
                                          <button type="button" className="adminActionButton" onClick={() => runEnrollmentAction(enr.accessId, () => adminPauseEnrollment(enr.accessId), "Paused")} aria-label={`Pause enrollment for ${enr.userFirstName} ${enr.userLastName}`}>
                                            Pause
                                          </button>
                                        )}
                                        {enr.accessStatus === "Paused" && (
                                          <button type="button" className="adminActionButton" onClick={() => runEnrollmentAction(enr.accessId, () => adminResumeEnrollment(enr.accessId), "Active")} aria-label={`Resume enrollment for ${enr.userFirstName} ${enr.userLastName}`}>
                                            Resume
                                          </button>
                                        )}
                                        {(enr.accessStatus === "Active" || enr.accessStatus === "Paused") && (
                                          <button type="button" className="adminActionButton adminActionButton--danger" onClick={() => runEnrollmentAction(enr.accessId, () => adminEndEnrollment(enr.accessId), "Completed")} aria-label={`End enrollment for ${enr.userFirstName} ${enr.userLastName}`}>
                                            End
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                }

                return rows;
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Start date picker modal */}
      {startPickerId && (
        <div className="adminModal__backdrop" onClick={() => setStartPickerId(null)}>
          <div className="adminModal" onClick={(ev) => ev.stopPropagation()}>
            <div className="adminModal__header">
              <h3 className="adminModal__title">Start Program</h3>
              <button type="button" className="adminModal__close" onClick={() => setStartPickerId(null)} aria-label="Close">✕</button>
            </div>
            <div className="adminModal__body">
              <label className="field">
                <span className="field__label">Start date</span>
                <input className="field__input" type="date" value={startDate} min={todayISO()} onChange={(ev) => setStartDate(ev.target.value)} disabled={!!startingId} />
              </label>
              {startDate === todayISO() ? (
                <p>Program will start immediately today.</p>
              ) : (
                <p>Scheduled for {formatDate(startDate + "T00:00:00")}. Emails sent to all parties.</p>
              )}
            </div>
            <div className="adminModal__compose">
              <button type="button" className="adminActionButton" onClick={() => setStartPickerId(null)} disabled={!!startingId}>Cancel</button>
              <button type="button" className="button" onClick={handleStartConfirm} disabled={!!startingId}>
                {startingId ? "Confirming…" : startDate === todayISO() ? "Start now" : "Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
