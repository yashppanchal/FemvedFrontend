import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import "./Login.scss";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    const err = login(email.trim(), password);
    if (err) {
      setError(err);
      return;
    }

    navigate("/");
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
          <p className="authCard__footer">
            Demo login: id <strong>demo</strong> / password <strong>demo123</strong>
          </p>

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

          <button type="submit" className="button authCard__submit">
            Sign in
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
