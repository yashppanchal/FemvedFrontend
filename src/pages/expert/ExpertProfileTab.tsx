import { type FormEvent, useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import {
  fetchCurrentExpertProfile,
  updateExpertProfile,
  type ExpertProfileResponse,
  type UpdateExpertProfileRequest,
} from "../../api/experts";
import { ApiError } from "../../api/client";

type ProfileForm = {
  displayName: string;
  title: string;
  bio: string;
  gridDescription: string;
  detailedDescription: string;
  profileImageUrl: string;
  gridImageUrl: string;
  specialisations: string;
  yearsExperience: string;
  credentials: string;
  locationCountry: string;
  isActive: boolean;
};

function profileToForm(p: ExpertProfileResponse): ProfileForm {
  return {
    displayName: p.displayName,
    title: p.title,
    bio: p.bio,
    gridDescription: p.gridDescription ?? "",
    detailedDescription: p.detailedDescription ?? "",
    profileImageUrl: p.profileImageUrl ?? "",
    gridImageUrl: p.gridImageUrl ?? "",
    specialisations: (p.specialisations ?? []).join(", "),
    yearsExperience: p.yearsExperience != null ? String(p.yearsExperience) : "",
    credentials: (p.credentials ?? []).join(", "),
    locationCountry: p.locationCountry ?? "",
    isActive: p.isActive,
  };
}

const emptyForm: ProfileForm = {
  displayName: "",
  title: "",
  bio: "",
  gridDescription: "",
  detailedDescription: "",
  profileImageUrl: "",
  gridImageUrl: "",
  specialisations: "",
  yearsExperience: "",
  credentials: "",
  locationCountry: "",
  isActive: true,
};

export default function ExpertProfileTab() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ExpertProfileResponse | null>(null);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentExpertProfile()
      .then((p) => {
        setProfile(p);
        setForm(profileToForm(p));
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load profile.");
      })
      .finally(() => setLoading(false));
  }, []);

  const startEditing = () => {
    if (profile) setForm(profileToForm(profile));
    setEditing(true);
    setError(null);
    setSuccess(null);
  };

  const cancelEditing = () => {
    if (profile) setForm(profileToForm(profile));
    setEditing(false);
    setError(null);
  };

  const set =
    (key: keyof ProfileForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.displayName.trim() || !form.title.trim() || !form.bio.trim()) {
      setError("Display name, title, and bio are required.");
      return;
    }

    const yearsRaw = parseInt(form.yearsExperience, 10);
    const payload: UpdateExpertProfileRequest = {
      displayName: form.displayName.trim(),
      title: form.title.trim(),
      bio: form.bio.trim(),
      gridDescription: form.gridDescription.trim() || form.bio.trim(),
      detailedDescription: form.detailedDescription.trim() || form.bio.trim(),
      profileImageUrl: form.profileImageUrl.trim() || null,
      gridImageUrl: form.gridImageUrl.trim() || null,
      specialisations: form.specialisations.split(",").map((s) => s.trim()).filter(Boolean),
      yearsExperience: yearsRaw > 0 ? yearsRaw : null,
      credentials: form.credentials.split(",").map((s) => s.trim()).filter(Boolean),
      locationCountry: form.locationCountry.trim() || null,
      isActive: form.isActive,
    };

    setSaving(true);
    try {
      const updated = await updateExpertProfile(payload);
      setProfile(updated);
      setForm(profileToForm(updated));
      setEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="expertSection__loading">Loading profile…</p>;

  return (
    <section className="expertSection">
      <div className="expertSection__header">
        <h2 className="expertSection__title">Profile</h2>
        {!editing && (
          <button type="button" className="button" onClick={startEditing}>
            Edit
          </button>
        )}
      </div>

      {success && <p className="expertSection__success">{success}</p>}
      {error && <p className="form__error">{error}</p>}

      {!editing && profile ? (
        <div className="expertProfileDetails">
          {([
            ["Display name", profile.displayName],
            ["Title", profile.title],
            ["Email", user?.email ?? ""],
            ["Location", profile.locationCountry || "—"],
            ["Years experience", String(profile.yearsExperience)],
            ["Specialisations", (profile.specialisations ?? []).join(", ") || "—"],
            ["Credentials", (profile.credentials ?? []).join(", ") || "—"],
            ["Bio", profile.bio || "—"],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} className="expertProfileDetails__row">
              <span className="expertProfileDetails__label">{label}</span>
              <span className="expertProfileDetails__value">{value}</span>
            </div>
          ))}
          <div className="expertProfileDetails__row">
            <span className="expertProfileDetails__label">Status</span>
            <span className="expertProfileDetails__value">
              {profile.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      ) : editing ? (
        <form className="form expertForm" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="field__label">Display name *</span>
            <input
              className="field__input"
              type="text"
              value={form.displayName}
              onChange={set("displayName")}
              disabled={saving}
            />
          </label>

          <label className="field">
            <span className="field__label">Title / Specialty *</span>
            <input
              className="field__input"
              type="text"
              value={form.title}
              onChange={set("title")}
              disabled={saving}
            />
          </label>

          <div className="expertForm__row">
            <label className="field">
              <span className="field__label">Location (country)</span>
              <input
                className="field__input"
                type="text"
                value={form.locationCountry}
                onChange={set("locationCountry")}
                disabled={saving}
              />
            </label>
            <label className="field">
              <span className="field__label">Years experience</span>
              <input
                className="field__input"
                type="number"
                min="0"
                value={form.yearsExperience}
                onChange={set("yearsExperience")}
                disabled={saving}
              />
            </label>
          </div>

          <label className="field">
            <span className="field__label">Specialisations (comma-separated)</span>
            <input
              className="field__input"
              type="text"
              value={form.specialisations}
              onChange={set("specialisations")}
              disabled={saving}
            />
          </label>

          <label className="field">
            <span className="field__label">Credentials (comma-separated)</span>
            <input
              className="field__input"
              type="text"
              value={form.credentials}
              onChange={set("credentials")}
              disabled={saving}
            />
          </label>

          <label className="field">
            <span className="field__label">Bio *</span>
            <textarea
              className="field__input expertForm__textarea"
              value={form.bio}
              onChange={set("bio")}
              disabled={saving}
            />
          </label>

          <label className="field">
            <span className="field__label">Grid description (short)</span>
            <textarea
              className="field__input expertForm__textarea expertForm__textarea--sm"
              value={form.gridDescription}
              onChange={set("gridDescription")}
              disabled={saving}
              placeholder="Defaults to bio if empty"
            />
          </label>

          <label className="field">
            <span className="field__label">Profile image URL</span>
            <input
              className="field__input"
              type="url"
              value={form.profileImageUrl}
              onChange={set("profileImageUrl")}
              disabled={saving}
            />
          </label>

          <label className="field">
            <span className="field__label">Grid image URL</span>
            <input
              className="field__input"
              type="url"
              value={form.gridImageUrl}
              onChange={set("gridImageUrl")}
              disabled={saving}
            />
          </label>

          <div className="expertForm__actions">
            <button
              type="button"
              className="button button--secondary"
              onClick={cancelEditing}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="button expertForm__submit" disabled={saving}>
              {saving ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
