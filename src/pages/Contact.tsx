import "./Contact.scss";

export default function Contact() {
  return (
    <section className="page page--contact">
      <div className="contact-container">
        <h1 className="page__title">Get in Touch</h1>
        <p className="page__lead">
          Have a question or want to learn more? Drop us a message and we'll get
          back to you soon.
        </p>

        <div className="card">
          <form className="form" noValidate>
            <label className="field">
              <span className="field__label">Name</span>
              <input
                className="field__input"
                name="name"
                type="text"
                required
                placeholder="Your name"
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
              />
            </label>

            <label className="field">
              <span className="field__label">Message</span>
              <textarea
                className="field__input field__textarea"
                name="message"
                required
                placeholder="How can we help?"
              />
            </label>

            <button className="button" type="button">
              Send Message
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
