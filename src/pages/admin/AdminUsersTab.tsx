import { type FormEvent, useEffect, useState } from "react";

import { PAGE_SIZE } from "../../constants";
import {
  getAdminUsers,
  activateAdminUser,
  deactivateAdminUser,
  changeUserRole,
  deleteAdminUser,
  adminCreateExpertProfile,
  adminChangeUserEmail,
  type AdminUser,
  type AdminCreateExpertProfileRequest,
} from "../../api/admin";
import { ApiError } from "../../api/client";

// ── Expert profile form shape (all optional) ─────────────────────────────────

const emptyExpertForm = {
  displayName: "",
  title: "",
  bio: "",
  gridDescription: "",
  detailedDescription: "",
  specialisations: "",
  credentials: "",
  yearsExperience: "",
  locationCountry: "",
  profileImageUrl: "",
  gridImageUrl: "",
};

type ExpertForm = typeof emptyExpertForm;

function expertFormToRequest(f: ExpertForm): AdminCreateExpertProfileRequest {
  const req: AdminCreateExpertProfileRequest = {};
  if (f.displayName.trim()) req.displayName = f.displayName.trim();
  if (f.title.trim()) req.title = f.title.trim();
  if (f.bio.trim()) req.bio = f.bio.trim();
  if (f.gridDescription.trim()) req.gridDescription = f.gridDescription.trim();
  if (f.detailedDescription.trim()) req.detailedDescription = f.detailedDescription.trim();
  if (f.profileImageUrl.trim()) req.profileImageUrl = f.profileImageUrl.trim();
  if (f.gridImageUrl.trim()) req.gridImageUrl = f.gridImageUrl.trim();
  if (f.locationCountry.trim()) req.locationCountry = f.locationCountry.trim();
  if (f.yearsExperience.trim()) req.yearsExperience = parseInt(f.yearsExperience, 10) || 0;
  const specs = f.specialisations.split(",").map((s) => s.trim()).filter(Boolean);
  if (specs.length) req.specialisations = specs;
  const creds = f.credentials.split(",").map((s) => s.trim()).filter(Boolean);
  if (creds.length) req.credentials = creds;
  return req;
}

function isExpertFormEmpty(f: ExpertForm): boolean {
  return Object.values(f).every((v) => !v.trim());
}

const ROLE_NAMES: Record<number, string> = { 1: "Admin", 2: "Expert", 3: "User" };

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminUsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Expert promotion panel state
  const [promotingUser, setPromotingUser] = useState<AdminUser | null>(null);
  const [expertForm, setExpertForm] = useState<ExpertForm>(emptyExpertForm);
  const [promoting, setPromoting] = useState(false);
  const [promoteError, setPromoteError] = useState<string | null>(null);

  // Email edit panel state
  const [emailEditUser, setEmailEditUser] = useState<AdminUser | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    getAdminUsers()
      .then(setUsers)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load users.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggleActive = async (user: AdminUser) => {
    setActionError(null);
    try {
      const updated = user.isActive
        ? await deactivateAdminUser(user.userId)
        : await activateAdminUser(user.userId);
      setUsers((prev) => prev.map((u) => (u.userId === user.userId ? updated : u)));
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to update user.");
    }
  };

  const handleRoleSelectChange = (user: AdminUser, roleId: number) => {
    setActionError(null);
    if (roleId === 2) {
      // Promoting to Expert — open the profile panel
      setPromotingUser(user);
      setExpertForm({ ...emptyExpertForm, displayName: `${user.firstName} ${user.lastName}`.trim() });
      setPromoteError(null);
    } else {
      // User or Admin — confirm before changing
      const newRoleName = ROLE_NAMES[roleId] ?? String(roleId);
      if (!confirm(`Change ${user.firstName} ${user.lastName} to ${newRoleName}?`)) return;
      changeUserRole(user.userId, roleId)
        .then(() =>
          setUsers((prev) =>
            prev.map((u) =>
              u.userId === user.userId
                ? { ...u, roleId, roleName: ROLE_NAMES[roleId] ?? String(roleId) }
                : u,
            ),
          ),
        )
        .catch((err) => setActionError(err instanceof ApiError ? err.message : "Failed to change role."));
    }
  };

  const handlePromoteConfirm = async (e: FormEvent) => {
    e.preventDefault();
    if (!promotingUser) return;
    setPromoteError(null);
    setPromoting(true);
    try {
      // Step 1: change role to Expert
      await changeUserRole(promotingUser.userId, 2);
      setUsers((prev) =>
        prev.map((u) =>
          u.userId === promotingUser.userId ? { ...u, roleId: 2, roleName: "Expert" } : u,
        ),
      );

      // Step 2: if any profile fields filled, create expert profile
      if (!isExpertFormEmpty(expertForm)) {
        const profileData = expertFormToRequest(expertForm);
        await adminCreateExpertProfile(promotingUser.userId, profileData);
      }

      setPromotingUser(null);
    } catch (err) {
      setPromoteError(err instanceof ApiError ? err.message : "Failed to promote user.");
    } finally {
      setPromoting(false);
    }
  };

  const handlePromoteCancel = () => {
    setPromotingUser(null);
    setPromoteError(null);
  };

  const openEmailEdit = (user: AdminUser) => {
    setEmailEditUser(user);
    setEmailInput(user.email);
    setEmailError(null);
  };

  const closeEmailEdit = () => {
    setEmailEditUser(null);
    setEmailError(null);
  };

  const handleEmailSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!emailEditUser) return;
    setEmailError(null);
    setSavingEmail(true);
    try {
      const updated = await adminChangeUserEmail(emailEditUser.userId, emailInput.trim());
      setUsers((prev) => prev.map((u) => (u.userId === emailEditUser.userId ? updated : u)));
      setEmailEditUser(null);
    } catch (err) {
      setEmailError(err instanceof ApiError ? err.message : "Failed to update email.");
    } finally {
      setSavingEmail(false);
    }
  };

  const handleDelete = async (userId: string, email: string) => {
    setActionError(null);
    if (!confirm(`Archive user ${email}? They will be soft-deleted and can re-register with the same email.`)) return;
    try {
      await deleteAdminUser(userId);
      setUsers((prev) => prev.filter((u) => u.userId !== userId));
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to archive user.");
    }
  };

  const setF = (key: keyof ExpertForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setExpertForm((prev) => ({ ...prev, [key]: e.target.value }));

  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "deleted">("all");

  const filtered = users.filter((u) => {
    const matchesSearch =
      (u.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      `${u.firstName ?? ""} ${u.lastName ?? ""}`.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === "active") return u.isActive && !u.isDeleted;
    if (statusFilter === "inactive") return !u.isActive && !u.isDeleted;
    if (statusFilter === "deleted") return u.isDeleted;
    return true;
  });

  // Reset to page 1 whenever search/filter changes
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  if (loading) return <p className="adminPanel__loading">Loading users…</p>;
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
        <select
          className="field__input"
          style={{ width: "auto", minWidth: 140 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive" | "deleted")}
        >
          <option value="all">All users</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="deleted">Deleted</option>
        </select>
        <span className="adminPanel__count">{filtered.length} users</span>
        {Math.ceil(filtered.length / PAGE_SIZE) > 1 && (
          <div className="adminPanel__pagination">
            <button type="button" className="adminActionButton" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            <button type="button" className="adminActionButton" disabled={page >= Math.ceil(filtered.length / PAGE_SIZE)} onClick={() => setPage((p) => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {actionError && <p className="adminPanel__error">{actionError}</p>}

      {/* ── Expert promotion panel ──────────────────────────────────────── */}
      {promotingUser && (
        <form className="adminForm adminForm--expertPromotion" onSubmit={handlePromoteConfirm} noValidate>
          <div className="adminForm__promotionHeader">
            <div>
              <h3 className="adminForm__title">
                Promote {promotingUser.firstName} {promotingUser.lastName} to Expert
              </h3>
              <p className="adminForm__subtitle">
                All fields below are optional. The expert can complete their profile later from their dashboard.
              </p>
            </div>
            <button type="button" className="adminModal__close" onClick={handlePromoteCancel} disabled={promoting} aria-label="Close">
              ✕
            </button>
          </div>

          {promoteError && <p className="adminPanel__error">{promoteError}</p>}

          <div className="adminForm__row adminForm__row--two">
            <label className="field">
              <span className="field__label">Display name</span>
              <input className="field__input" type="text" value={expertForm.displayName} onChange={setF("displayName")} disabled={promoting} placeholder="e.g. Dr. Priya Sharma" />
            </label>
            <label className="field">
              <span className="field__label">Title / Specialty</span>
              <input className="field__input" type="text" value={expertForm.title} onChange={setF("title")} disabled={promoting} placeholder="e.g. Ayurvedic Practitioner" />
            </label>
          </div>

          <div className="adminForm__row adminForm__row--two">
            <label className="field">
              <span className="field__label">Location (country)</span>
              <input className="field__input" type="text" value={expertForm.locationCountry} onChange={setF("locationCountry")} disabled={promoting} placeholder="e.g. India" />
            </label>
            <label className="field">
              <span className="field__label">Years of experience</span>
              <input className="field__input" type="number" min="0" value={expertForm.yearsExperience} onChange={setF("yearsExperience")} disabled={promoting} placeholder="e.g. 8" />
            </label>
          </div>

          <div className="adminForm__row adminForm__row--two">
            <label className="field">
              <span className="field__label">Specialisations (comma-separated)</span>
              <input className="field__input" type="text" value={expertForm.specialisations} onChange={setF("specialisations")} disabled={promoting} placeholder="e.g. PCOS, Hormonal Health, Fertility" />
            </label>
            <label className="field">
              <span className="field__label">Credentials (comma-separated)</span>
              <input className="field__input" type="text" value={expertForm.credentials} onChange={setF("credentials")} disabled={promoting} placeholder="e.g. BAMS, MD Ayurveda" />
            </label>
          </div>

          <label className="field">
            <span className="field__label">Bio</span>
            <textarea className="field__input adminForm__textarea" value={expertForm.bio} onChange={setF("bio")} disabled={promoting} placeholder="A short professional bio shown on the expert's public profile…" />
          </label>

          <label className="field">
            <span className="field__label">Short card description</span>
            <textarea className="field__input adminForm__textarea adminForm__textarea--sm" value={expertForm.gridDescription} onChange={setF("gridDescription")} disabled={promoting} placeholder="1–2 sentences shown on browse cards. Defaults to bio if blank." />
          </label>

          <div className="adminForm__row adminForm__row--two">
            <label className="field">
              <span className="field__label">Profile image URL</span>
              <input className="field__input" type="url" value={expertForm.profileImageUrl} onChange={setF("profileImageUrl")} disabled={promoting} placeholder="https://res.cloudinary.com/…" />
            </label>
            <label className="field">
              <span className="field__label">Grid / card image URL</span>
              <input className="field__input" type="url" value={expertForm.gridImageUrl} onChange={setF("gridImageUrl")} disabled={promoting} placeholder="https://res.cloudinary.com/…" />
            </label>
          </div>

          <div className="adminForm__actions">
            <button type="button" className="adminActionButton" onClick={handlePromoteCancel} disabled={promoting}>
              Cancel
            </button>
            <button type="submit" className="button" disabled={promoting}>
              {promoting ? "Promoting…" : isExpertFormEmpty(expertForm) ? "Promote" : "Promote & Save Changes"}
            </button>
          </div>
        </form>
      )}

      {/* ── Email edit panel ─────────────────────────────────────────────── */}
      {emailEditUser && (
        <form className="adminForm adminForm--expertPromotion" onSubmit={handleEmailSave} noValidate>
          <div className="adminForm__promotionHeader">
            <div>
              <h3 className="adminForm__title">
                Change email — {emailEditUser.firstName} {emailEditUser.lastName}
              </h3>
              <p className="adminForm__subtitle">Current: {emailEditUser.email}</p>
            </div>
            <button type="button" className="adminModal__close" onClick={closeEmailEdit} disabled={savingEmail} aria-label="Close">✕</button>
          </div>
          {emailError && <p className="adminPanel__error">{emailError}</p>}
          <label className="field">
            <span className="field__label">New email address</span>
            <input
              className="field__input"
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              disabled={savingEmail}
              placeholder="new@example.com"
              required
            />
          </label>
          <div className="adminForm__actions">
            <button type="button" className="adminActionButton" onClick={closeEmailEdit} disabled={savingEmail}>Cancel</button>
            <button type="submit" className="button" disabled={savingEmail || !emailInput.trim()}>
              {savingEmail ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      )}

      {/* ── Users table ─────────────────────────────────────────────────── */}
      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
              <th scope="col">Status</th>
              <th scope="col">Joined</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="adminTable__empty">No users found.</td>
              </tr>
            ) : (
              filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((u) => (
                <tr
                  key={u.userId}
                  className={
                    promotingUser?.userId === u.userId || emailEditUser?.userId === u.userId
                      ? "adminTable__row--highlighted"
                      : ""
                  }
                >
                  <td>{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`statusBadge statusBadge--${u.roleId === 1 ? "active" : u.roleId === 2 ? "pending" : "ended"}`}>
                      {u.roleName}
                    </span>
                  </td>
                  <td>
                    <span className={`statusBadge statusBadge--${u.isDeleted ? "cancelled" : u.isActive ? "active" : "ended"}`}>
                      {u.isDeleted ? "Deleted" : u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="adminTable__actions">
                    {u.isDeleted ? (
                      <span style={{ fontSize: 13, color: "var(--muted)" }}>No actions</span>
                    ) : (
                      <>
                        <select
                          className="field__input adminTable__roleSelect"
                          value={String(u.roleId)}
                          onChange={(ev) => handleRoleSelectChange(u, Number(ev.target.value))}
                          disabled={promoting}
                        >
                          <option value="3">User</option>
                          <option value="2">Expert</option>
                          <option value="1">Admin</option>
                        </select>
                        <button
                          type="button"
                          className="adminActionButton"
                          onClick={() => openEmailEdit(u)}
                          disabled={promoting}
                          aria-label={`Edit email for ${u.firstName} ${u.lastName}`}
                        >
                          Edit email
                        </button>
                        <button
                          type="button"
                          className="adminActionButton"
                          onClick={() => handleToggleActive(u)}
                          disabled={promoting}
                          aria-label={`${u.isActive ? "Deactivate" : "Activate"} ${u.firstName} ${u.lastName}`}
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          className="adminActionButton adminActionButton--danger"
                          onClick={() => handleDelete(u.userId, u.email)}
                          disabled={promoting}
                          aria-label={`Archive user ${u.firstName} ${u.lastName}`}
                        >
                          Archive
                        </button>
                      </>
                    )}
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
