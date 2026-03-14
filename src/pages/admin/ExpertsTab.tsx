import { type FormEvent, useEffect, useState } from "react";
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
    bio: "",
    gridDescription: "",
    specialisations: "",
    credentials: "",
    yearsExperience: "",
    locationCountry: e.locationCountry ?? "",
    profileImageUrl: "",
    gridImageUrl: "",
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

const today = () => new Date().toISOString().split("T")[0];

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

  // Expanded expert programs/enrollments
  const [expandedExpertId, setExpandedExpertId] = useState<string | null>(null);
  const [expertPrograms, setExpertPrograms] = useState<AdminExpertProgram[]>([]);
  const [expertEnrollments, setExpertEnrollments] = useState<AdminEnrollment[]>([]);
  const [expandedLoading, setExpandedLoading] = useState(false);
  const [expandedError, setExpandedError] = useState<string | null>(null);
  const [enrollmentActionError, setEnrollmentActionError] = useState<string | null>(null);

  // Start date picker modal
  const [startPickerId, setStartPickerId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(today());
  const [startingId, setStartingId] = useState<string | null>(null);

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
      if (expandedExpertId === expertId) setExpandedExpertId(null);
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
      await adminStartEnrollment(startPickerId, startDate !== today() ? startDate : undefined);
      if (startDate === today()) {
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
      setStartDate(today());
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
              <h3 className="adminForm__title">Edit profile — {editingExpert.displayName || editingExpert.userEmail}</h3>
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
            <textarea className="field__input adminForm__textarea" value={editForm.bio} onChange={setF("bio")} disabled={saving} placeholder="Professional bio…" />
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
              filtered.flatMap((e) => {
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
                      <button type="button" className="adminActionButton" onClick={() => toggleExpand(e.expertId)}>
                        {expandedExpertId === e.expertId ? "Hide details" : "View programs"}
                      </button>
                      <button type="button" className="adminActionButton" onClick={() => openEdit(e)}>
                        Edit profile
                      </button>
                      <button type="button" className="adminActionButton" onClick={() => handleToggleActive(e)}>
                        {e.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button type="button" className="adminActionButton adminActionButton--danger" onClick={() => handleDelete(e.expertId, e.displayName)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ];

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
                                    <th>Program</th>
                                    <th>Total Enrolled</th>
                                    <th>Active</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {expertPrograms.map((p) => (
                                    <tr key={p.programId}>
                                      <td>{p.programName}</td>
                                      <td>{p.totalEnrollments}</td>
                                      <td>{p.activeEnrollments}</td>
                                      <td>
                                        <span className={`statusBadge statusBadge--${(p.status || "").toLowerCase() === "active" ? "active" : "ended"}`}>
                                          {p.status}
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
                                    <th>Client</th>
                                    <th>Program</th>
                                    <th>Duration</th>
                                    <th>Status</th>
                                    <th>Start / End Date</th>
                                    <th>Requested Start</th>
                                    <th>Actions</th>
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
                                        <span className={`statusBadge statusBadge--${(enr.scheduledStartAt && enr.accessStatus === "NotStarted" ? "scheduled" : (enr.accessStatus || "")).toLowerCase()}`}>
                                          {enr.scheduledStartAt && enr.accessStatus === "NotStarted" ? "Scheduled" : enr.accessStatus}
                                        </span>
                                      </td>
                                      <td>
                                        {enr.startedAt ? (
                                          <>
                                            <div>{new Date(enr.startedAt).toLocaleDateString()}</div>
                                            {enr.endDate && <div className="adminTable__sub">Ends: {new Date(enr.endDate).toLocaleDateString()}</div>}
                                          </>
                                        ) : enr.scheduledStartAt ? (
                                          <div>{new Date(enr.scheduledStartAt).toLocaleDateString()}</div>
                                        ) : "—"}
                                      </td>
                                      <td>
                                        {enr.requestedStartDate ? (
                                          <>
                                            <div>{new Date(enr.requestedStartDate).toLocaleDateString()}</div>
                                            {enr.startRequestStatus && <div className="adminTable__sub">{enr.startRequestStatus}</div>}
                                          </>
                                        ) : "—"}
                                      </td>
                                      <td className="adminTable__actions">
                                        {enr.accessStatus === "NotStarted" && (
                                          <button type="button" className="adminActionButton" onClick={() => { setStartPickerId(enr.accessId); setStartDate(today()); }}>
                                            {enr.scheduledStartAt ? "Reschedule" : "Start"}
                                          </button>
                                        )}
                                        {enr.startRequestStatus === "Pending" && (
                                          <>
                                            <button type="button" className="adminActionButton" onClick={() => runEnrollmentAction(enr.accessId, () => adminApproveStartDate(enr.accessId), enr.accessStatus)}>
                                              Approve
                                            </button>
                                            <button type="button" className="adminActionButton adminActionButton--danger" onClick={() => runEnrollmentAction(enr.accessId, () => adminDeclineStartDate(enr.accessId), enr.accessStatus)}>
                                              Decline
                                            </button>
                                          </>
                                        )}
                                        {enr.accessStatus === "Active" && (
                                          <button type="button" className="adminActionButton" onClick={() => runEnrollmentAction(enr.accessId, () => adminPauseEnrollment(enr.accessId), "Paused")}>
                                            Pause
                                          </button>
                                        )}
                                        {enr.accessStatus === "Paused" && (
                                          <button type="button" className="adminActionButton" onClick={() => runEnrollmentAction(enr.accessId, () => adminResumeEnrollment(enr.accessId), "Active")}>
                                            Resume
                                          </button>
                                        )}
                                        {(enr.accessStatus === "Active" || enr.accessStatus === "Paused") && (
                                          <button type="button" className="adminActionButton adminActionButton--danger" onClick={() => runEnrollmentAction(enr.accessId, () => adminEndEnrollment(enr.accessId), "Completed")}>
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
              <button type="button" className="adminModal__close" onClick={() => setStartPickerId(null)}>✕</button>
            </div>
            <div className="adminModal__body">
              <label className="field">
                <span className="field__label">Start date</span>
                <input className="field__input" type="date" value={startDate} min={today()} onChange={(ev) => setStartDate(ev.target.value)} disabled={!!startingId} />
              </label>
              {startDate === today() ? (
                <p>Program will start immediately today.</p>
              ) : (
                <p>Scheduled for {new Date(startDate + "T00:00:00").toLocaleDateString()}. Emails sent to all parties.</p>
              )}
            </div>
            <div className="adminModal__compose">
              <button type="button" className="adminActionButton" onClick={() => setStartPickerId(null)} disabled={!!startingId}>Cancel</button>
              <button type="button" className="button" onClick={handleStartConfirm} disabled={!!startingId}>
                {startingId ? "Confirming…" : startDate === today() ? "Start now" : "Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
