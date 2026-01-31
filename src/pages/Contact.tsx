export default function Contact() {
  return (
    <section className="page">
      <h1 className="page__title">Contact</h1>
      <p className="page__lead">
        Reach us at <a href="mailto:hello@femved.com">hello@femved.com</a>.
      </p>

      <div className="card">
        <form className="form" onSubmit={(e) => e.preventDefault()}>
          <label className="field">
            <span className="field__label">Name</span>
            <input className="field__input" name="name" type="text" />
          </label>
          <label className="field">
            <span className="field__label">Email</span>
            <input className="field__input" name="email" type="email" />
          </label>
          <label className="field">
            <span className="field__label">Message</span>
            <textarea className="field__input field__textarea" name="message" />
          </label>
          <button className="button" type="submit">
            Send
          </button>
        </form>
      </div>
    </section>
  );
}
