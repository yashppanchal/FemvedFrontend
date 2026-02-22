import { useState, type FormEvent } from "react";
import "./Contact.scss";

const WEB3FORMS_KEY = "YOUR_ACCESS_KEY_HERE";

type FormStatus = "idle" | "sending" | "success" | "error";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");

  const canSubmit =
    name.trim() !== "" &&
    email.trim() !== "" &&
    message.trim() !== "" &&
    status !== "sending";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus("sending");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `New contact from ${name}`,
          from_name: name,
          email,
          message,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="page page--contact">
      <div className="contact-container">
        <h1 className="page__title">Get in Touch</h1>
        <p className="page__lead">
          Have a question or want to learn more? Drop us a message and we'll get
          back to you soon.
        </p>

        <div className="card">
          {status === "success" ? (
            <div className="form-success">
              <span className="form-success__icon">&#10003;</span>
              <h2 className="form-success__title">Message Sent!</h2>
              <p className="form-success__text">
                Thank you for reaching out. We'll respond within 24–48 hours.
              </p>
              <button
                className="button button--outline"
                onClick={() => setStatus("idle")}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form className="form" onSubmit={handleSubmit} noValidate>
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
                />
              </label>

              {status === "error" && (
                <p className="form-error">
                  Something went wrong. Please try again or email us directly at{" "}
                  <a href="mailto:femvedwellness@gmail.com">
                    femvedwellness@gmail.com
                  </a>
                  .
                </p>
              )}

              <button
                className="button"
                type="submit"
                disabled={!canSubmit}
              >
                {status === "sending" ? "Sending…" : "Send Message"}
              </button>
            </form>
          )}
        </div>

        <p className="contact-alt">
          You can also reach us directly at{" "}
          <a href="mailto:femvedwellness@gmail.com">femvedwellness@gmail.com</a>
        </p>
      </div>
    </section>
  );
}
