import { useState, type FormEvent } from "react";
import { submitContact } from "../api/contact";
import { ApiError } from "../api/client";
import "./Contact.scss";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg("Please fill in your name, email, and message.");
      return;
    }

    setSubmitting(true);
    try {
      await submitContact({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });
      setSuccessMsg(
        "Thanks — your message is on its way. We've also sent you a confirmation email.",
      );
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setErrorMsg(
        err instanceof ApiError
          ? err.message
          : "Could not send your message. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page page--contact">
      <div className="contact-container">
        <h1 className="page__title">Get in Touch</h1>
        <p className="page__lead">
          Have a question or want to learn more? Drop us a message and we'll get
          back to you soon.
        </p>

        <div className="card">
          <form className="form" noValidate onSubmit={onSubmit}>
            <label className="field">
              <span className="field__label">Name</span>
              <input
                className="field__input"
                name="name"
                type="text"
                required
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
              />
            </label>

            <label className="field">
              <span className="field__label">Email</span>
              <input
                className="field__input"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
            </label>

            <label className="field">
              <span className="field__label">Message</span>
              <textarea
                className="field__input field__textarea"
                name="message"
                required
                placeholder="How can we help?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={submitting}
              />
            </label>

            {successMsg && (
              <p className="contact-success" role="status">
                {successMsg}
              </p>
            )}
            {errorMsg && (
              <p className="contact-error" role="alert">
                {errorMsg}
              </p>
            )}

            <button className="button" type="submit" disabled={submitting}>
              {submitting ? "Sending…" : "Send Message"}
            </button>
          </form>
        </div>

        <p className="contact-alt">
          You can also reach us directly at{" "}
          <a href="mailto:femvedwellness@gmail.com">femvedwellness@gmail.com</a>
        </p>
      </div>
    </section>
  );
}
