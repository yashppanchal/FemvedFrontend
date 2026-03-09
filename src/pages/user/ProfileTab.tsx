import { type FormEvent, useEffect, useState } from "react";
import { FiEdit2, FiCheck, FiX } from "react-icons/fi";
import { useAuth } from "../../auth/useAuth";
import { useCountry, validatePhone } from "../../country/useCountry";
import { getMyProfile, updateMyProfile } from "../../api/users";
import { ApiError } from "../../api/client";

export default function ProfileTab() {
  const { user: authUser, updateAuthUser } = useAuth();
  const { country, countryInfo } = useCountry();

  const [firstName, setFirstName] = useState(authUser?.firstName ?? "");
  const [lastName, setLastName] = useState(authUser?.lastName ?? "");
  const [email, setEmail] = useState(authUser?.email ?? "");
  const [phone, setPhone] = useState(authUser?.phone ?? "");

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch fresh profile on mount
  useEffect(() => {
    getMyProfile()
      .then((p) => {
        setFirstName(p.firstName);
        setLastName(p.lastName);
        setEmail(p.email);
        setPhone(p.mobileNumber ? `${p.countryCode} ${p.mobileNumber}`.trim() : "");
      })
      .catch(() => {
        // Fall back to auth state — no need to surface network error on view
      });
  }, []);

  const startEditing = () => {
    const rawPhone = phone.startsWith(countryInfo.dialCode)
      ? phone.slice(countryInfo.dialCode.length).trim()
      : phone;
    setForm({ firstName, lastName, phone: rawPhone });
    setEditing(true);
    setError(null);
    setSuccess(null);
    setPhoneError(null);
  };

  const cancelEditing = () => {
    setEditing(false);
    setError(null);
    setPhoneError(null);
  };

  const set =
    (key: "firstName" | "lastName") =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[a-zA-Z]/g, "");
    if (value.replace(/\D/g, "").length > 10) return;
    setForm((prev) => ({ ...prev, phone: value }));
    if (phoneError) setPhoneError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    if (form.phone.trim()) {
      const phoneErr = validatePhone(form.phone, country);
      if (phoneErr) { setPhoneError(phoneErr); return; }
    }
    setPhoneError(null);

    setSaving(true);
    try {
      const updated = await updateMyProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        mobileNumber: form.phone.trim() || undefined,
        countryCode: form.phone.trim() ? countryInfo.dialCode : undefined,
      });
      setFirstName(updated.firstName);
      setLastName(updated.lastName);
      setPhone(updated.mobileNumber ? `${updated.countryCode} ${updated.mobileNumber}`.trim() : "");
      updateAuthUser({ firstName: updated.firstName, lastName: updated.lastName });
      setEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashCard">
      <div className="dashCard__header">
        <h2 className="dashCard__heading">Profile</h2>
        {!editing && (
          <button type="button" className="dashCard__editBtn" onClick={startEditing}>
            <FiEdit2 /> Edit
          </button>
        )}
      </div>

      {success && <p className="dashCard__success">{success}</p>}
      {error && <p className="dashCard__error">{error}</p>}

      {editing ? (
        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="dashCard__row">
            <label className="field">
              <span className="field__label">First name *</span>
              <input
                className="field__input"
                type="text"
                value={form.firstName}
                onChange={set("firstName")}
                placeholder="Jane"
                autoComplete="given-name"
                autoFocus
                disabled={saving}
              />
            </label>
            <label className="field">
              <span className="field__label">Last name *</span>
              <input
                className="field__input"
                type="text"
                value={form.lastName}
                onChange={set("lastName")}
                placeholder="Doe"
                autoComplete="family-name"
                disabled={saving}
              />
            </label>
          </div>

          <label className="field">
            <span className="field__label">Email</span>
            <input
              className="field__input field__input--disabled"
              type="email"
              value={email}
              disabled
            />
          </label>

          <div className="field">
            <span className="field__label">Phone number</span>
            <div className="phoneField">
              <span className="phoneField__prefix">{countryInfo.dialCode}</span>
              <input
                className="field__input phoneField__input"
                type="tel"
                inputMode="numeric"
                value={form.phone}
                onChange={handlePhoneChange}
                placeholder={countryInfo.placeholder}
                autoComplete="tel-national"
                disabled={saving}
              />
            </div>
            {phoneError && <span className="field__error">{phoneError}</span>}
          </div>

          <div className="dashCard__actions">
            <button type="submit" className="button dashCard__saveBtn" disabled={saving}>
              <FiCheck /> {saving ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              className="dashCard__cancelBtn"
              onClick={cancelEditing}
              disabled={saving}
            >
              <FiX /> Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="profileInfo">
          <div className="profileInfo__row">
            <span className="profileInfo__label">First name</span>
            <span className="profileInfo__value">{firstName}</span>
          </div>
          <div className="profileInfo__row">
            <span className="profileInfo__label">Last name</span>
            <span className="profileInfo__value">{lastName}</span>
          </div>
          <div className="profileInfo__row">
            <span className="profileInfo__label">Email</span>
            <span className="profileInfo__value">{email}</span>
          </div>
          <div className="profileInfo__row">
            <span className="profileInfo__label">Phone</span>
            <span className="profileInfo__value">{phone || "Not provided"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
