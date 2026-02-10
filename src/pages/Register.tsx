import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, type RegisterData } from "../auth/useAuth";
import { useCountry, validatePhone } from "../country/useCountry";
import "./Register.scss";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { country, countryInfo } = useCountry();

  const [form, setForm] = useState<RegisterData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof RegisterData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  /** Only allow digits, spaces, dashes, and parentheses in the phone field. Max 10 digits. */
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[a-zA-Z]/g, "");
    // Block input if it already has 10 digits
    const digitCount = value.replace(/\D/g, "").length;
    if (digitCount > 10) return;
    setForm((prev) => ({ ...prev, phone: value }));
    // Clear phone-specific error when user edits
    if (phoneError) setPhoneError(null);
  };

  const [phoneError, setPhoneError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const { email, password, confirmPassword, firstName, lastName } = form;
    if (!email.trim() || !password || !confirmPassword || !firstName.trim() || !lastName.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    // Validate phone number for the selected country
    const phoneErr = validatePhone(form.phone, country);
    if (phoneErr) {
      setPhoneError(phoneErr);
      return;
    }
    setPhoneError(null);

    // Prefix the dial code so we store the full international number
    const fullPhone = form.phone.trim()
      ? `${countryInfo.dialCode} ${form.phone.trim()}`
      : "";

    const err = register({
      ...form,
      email: email.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: fullPhone,
    });

    if (err) {
      setError(err);
      return;
    }

    navigate("/");
  };

  return (
    <section className="page page--register">
      <h1 className="page__title">Create an account</h1>
      <p className="page__lead">
        Join Femved and start your holistic wellness journey today.
      </p>

      <div className="authCard">
        <form className="form" onSubmit={handleSubmit} noValidate>
          {error && <p className="authCard__error">{error}</p>}

          <div className="authCard__row">
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
            <span className="field__label">Email *</span>
            <input
              className="field__input"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@example.com"
              autoComplete="email"
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
              />
            </div>
            {phoneError && (
              <span className="field__error">{phoneError}</span>
            )}
          </div>

          <label className="field">
            <span className="field__label">Password *</span>
            <input
              className="field__input"
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </label>

          <label className="field">
            <span className="field__label">Confirm password *</span>
            <input
              className="field__input"
              type="password"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              placeholder="Repeat your password"
              autoComplete="new-password"
            />
          </label>

          <button type="submit" className="button authCard__submit">
            Create account
          </button>
        </form>

        <p className="authCard__footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </section>
  );
}
