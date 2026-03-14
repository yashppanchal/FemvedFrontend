import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth";
import { ApiError } from "../api/client";
import "./Login.scss";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page page--login">
      <h1 className="page__title">Forgot password</h1>
      <p className="page__lead">
        Enter your email address and we&rsquo;ll send you a link to reset your password.
      </p>

      <div className="authCard">
        {sent ? (
          <>
            <p className="authCard__success">
              If an account exists for <strong>{email}</strong>, a password reset link has been
              sent. Check your inbox (and spam folder).
            </p>
            <p className="authCard__footer">
              <Link to="/login">Back to sign in</Link>
            </p>
          </>
        ) : (
          <>
            <form className="form" onSubmit={handleSubmit} noValidate>
              {error && <p className="authCard__error">{error}</p>}

              <label className="field">
                <span className="field__label">Email</span>
                <input
                  className="field__input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                  disabled={loading}
                />
              </label>

              <button type="submit" className="button authCard__submit" disabled={loading}>
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>

            <p className="authCard__footer">
              <Link to="/login">Back to sign in</Link>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
