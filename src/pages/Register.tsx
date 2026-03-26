import { type FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, type RegisterData } from "../auth/useAuth";
import { useCountry, validatePhone, COUNTRY_LIST, type CountryCode } from "../country/useCountry";
import { usePageTitle } from "../usePageTitle";
import "./Register.scss";

export default function Register() {
  usePageTitle("Create Account");
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { country, countryInfo } = useCountry();
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(country);
  const selectedCountryInfo = COUNTRY_LIST.find((c) => c.code === selectedCountry) ?? countryInfo;

  const [form, setForm] = useState<
    Omit<RegisterData, "countryCode" | "mobileNumber"> & { phone: string }
  >({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const { email, password, confirmPassword, firstName, lastName } = form;
    if (!email.trim() || !password || !confirmPassword || !firstName.trim() || !lastName.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    // Validate phone number for the selected country
    const phoneErr = validatePhone(form.phone, selectedCountry);
    if (phoneErr) {
      setPhoneError(phoneErr);
      return;
    }
    setPhoneError(null);

    const mobileNumber = form.phone.trim();

    setLoading(true);

    const result = await register({
      email: email.trim(),
      password,
      confirmPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      countryCode: selectedCountryInfo.dialCode,
      mobileNumber,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.redirectTo !== "/") {
      // Admin or Expert — go to their dedicated dashboard
      navigate(result.redirectTo, { replace: true });
    } else {
      // Regular user — go back to the page they came from, or home
      const state = location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null;
      const from = state?.from;
      const destination = from?.pathname && from.pathname.startsWith("/")
        ? `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`
        : "/";
      navigate(destination, { replace: true });
    }
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
                disabled={loading}
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
                disabled={loading}
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
              disabled={loading}
            />
          </label>

          <div className="field">
            <span className="field__label">Phone number</span>
            <div className="phoneField">
              <select
                className="phoneField__countrySelect"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value as CountryCode)}
                disabled={loading}
                aria-label="Country dial code"
              >
                {COUNTRY_LIST.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.dialCode}
                  </option>
                ))}
              </select>
              <input
                className="field__input phoneField__input"
                type="tel"
                inputMode="numeric"
                value={form.phone}
                onChange={handlePhoneChange}
                placeholder={selectedCountryInfo.placeholder}
                autoComplete="tel-national"
                disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            />
          </label>

          <button
            type="submit"
            className="button authCard__submit"
            disabled={loading}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="authCard__footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </section>
  );
}
