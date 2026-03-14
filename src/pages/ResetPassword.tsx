import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/auth";
import { ApiError } from "../api/client";
import "./Login.scss";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset link.");
    }
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setDone(true);
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "The reset link may have expired. Please request a new one.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page page--login">
      <h1 className="page__title">Reset password</h1>
      <p className="page__lead">Choose a new password for your account.</p>

      <div className="authCard">
        {done ? (
          <>
            <p className="authCard__success">
              Your password has been reset successfully. Redirecting to sign in…
            </p>
            <p className="authCard__footer">
              <Link to="/login">Sign in now</Link>
            </p>
          </>
        ) : (
          <>
            <form className="form" onSubmit={handleSubmit} noValidate>
              {error && <p className="authCard__error">{error}</p>}

              <label className="field">
                <span className="field__label">New password</span>
                <input
                  className="field__input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  autoFocus
                  disabled={loading || !token}
                />
              </label>

              <label className="field">
                <span className="field__label">Confirm new password</span>
                <input
                  className="field__input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  autoComplete="new-password"
                  disabled={loading || !token}
                />
              </label>

              <button
                type="submit"
                className="button authCard__submit"
                disabled={loading || !token}
              >
                {loading ? "Resetting…" : "Reset password"}
              </button>
            </form>

            <p className="authCard__footer">
              <Link to="/forgot-password">Request a new reset link</Link>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
