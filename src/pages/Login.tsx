import { type FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import "./Login.scss";

interface LoginRedirectState {
  from?: {
    pathname?: string;
    search?: string;
    hash?: string;
  };
}

export default function Login() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const err = await login(email.trim(), password);
      if (err) {
        setError(err);
        return;
      }
      const redirectState = location.state as LoginRedirectState | null;
      const fromPathname = redirectState?.from?.pathname;
      const fromSearch = redirectState?.from?.search ?? "";
      const fromHash = redirectState?.from?.hash ?? "";
      const redirectTo =
        fromPathname && fromPathname.startsWith("/")
          ? `${fromPathname}${fromSearch}${fromHash}`
          : "/";

      navigate(redirectTo, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page page--login">
      <h1 className="page__title">Welcome back</h1>
      <p className="page__lead">
        Sign in to your Femved account to continue your wellness journey.
      </p>

      <div className="authCard">
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
            />
          </label>

          <label className="field">
            <span className="field__label">Password</span>
            <input
              className="field__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
            />
          </label>

          <button type="submit" className="button authCard__submit" disabled={loading}>
            {loading ? "Signing in\u2026" : "Sign in"}
          </button>
        </form>

        <p className="authCard__footer">
          Don&rsquo;t have an account?{" "}
          <Link to="/register">Create an account</Link>
        </p>
      </div>
    </section>
  );
}
