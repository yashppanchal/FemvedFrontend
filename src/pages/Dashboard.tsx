import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiCheck, FiX } from "react-icons/fi";
import { useAuth, type UpdateProfileData } from "../auth/useAuth";
import { useCountry, validatePhone } from "../country/useCountry";
import "./Dashboard.scss";

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { country, countryInfo } = useCountry();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UpdateProfileData>({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
  }, [user, navigate]);

  // Sync form state when user changes or edit mode is entered
  useEffect(() => {
    if (user) {
      // Strip dial code prefix from stored phone for the input field
      const rawPhone = user.phone.startsWith(countryInfo.dialCode)
        ? user.phone.slice(countryInfo.dialCode.length).trim()
        : user.phone;
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: rawPhone,
      });
    }
  }, [user, countryInfo.dialCode, editing]);

  if (!user) return null;

  const startEditing = () => {
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
    (key: keyof UpdateProfileData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[a-zA-Z]/g, "");
    const digitCount = value.replace(/\D/g, "").length;
    if (digitCount > 10) return;
    setForm((prev) => ({ ...prev, phone: value }));
    if (phoneError) setPhoneError(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    if (form.phone.trim()) {
      const phoneErr = validatePhone(form.phone, country);
      if (phoneErr) {
        setPhoneError(phoneErr);
        return;
      }
    }
    setPhoneError(null);

    const fullPhone = form.phone.trim()
      ? `${countryInfo.dialCode} ${form.phone.trim()}`
      : "";

    const err = updateUser({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: fullPhone,
    });

    if (err) {
      setError(err);
      return;
    }

    setEditing(false);
    setSuccess("Profile updated successfully.");
  };

  return (
    <section className="page page--dashboard">
      <h1 className="page__title">Dashboard</h1>
      <p className="page__lead">
        Welcome back, {user.firstName}. Manage your profile information below.
      </p>

      <div className="dashCard">
        <div className="dashCard__header">
          <h2 className="dashCard__heading">Profile</h2>
          {!editing && (
            <button
              type="button"
              className="dashCard__editBtn"
              onClick={startEditing}
            >
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
                />
              </label>
            </div>

            <label className="field">
              <span className="field__label">Email</span>
              <input
                className="field__input field__input--disabled"
                type="email"
                value={user.email}
                disabled
              />
            </label>

            <div className="field">
              <span className="field__label">Phone number</span>
              <div className="phoneField">
                <span className="phoneField__prefix">
                  {countryInfo.dialCode}
                </span>
                <input
                  className="field__input phoneField__input"
                  type="tel"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={handlePhoneChange}
                  placeholder={countryInfo.placeholder}
                  autoComplete="tel-national"
                />
              </div>
              {phoneError && (
                <span className="field__error">{phoneError}</span>
              )}
            </div>

            <div className="dashCard__actions">
              <button type="submit" className="button dashCard__saveBtn">
                <FiCheck /> Save changes
              </button>
              <button
                type="button"
                className="dashCard__cancelBtn"
                onClick={cancelEditing}
              >
                <FiX /> Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profileInfo">
            <div className="profileInfo__row">
              <span className="profileInfo__label">First name</span>
              <span className="profileInfo__value">{user.firstName}</span>
            </div>
            <div className="profileInfo__row">
              <span className="profileInfo__label">Last name</span>
              <span className="profileInfo__value">{user.lastName}</span>
            </div>
            <div className="profileInfo__row">
              <span className="profileInfo__label">Email</span>
              <span className="profileInfo__value">{user.email}</span>
            </div>
            <div className="profileInfo__row">
              <span className="profileInfo__label">Phone</span>
              <span className="profileInfo__value">
                {user.phone || "Not provided"}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
