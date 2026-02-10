import "./About.scss";

export default function About() {
  return (
    <section className="page about">
      {/* ── Hero ── */}
      <div className="about__hero">
        <p className="about__heroLabel">About Femved</p>
        <h1 className="about__heroTitle">
          Own your wellness — your well-being matters.
        </h1>
      </div>

      {/* ── Lost & searching ── */}
      <div className="about__section about__section--searching">
        <div className="about__prose">
          <p>
            Are you finding yourself more tuned into your health but feeling
            lost on where to start? You're not alone—many of us are waking up
            to the fact that our well-being is way more complex than the quick
            fixes we're offered.
          </p>
          <p>
            The system often feels stuck in this outdated "pill for every ill"
            mindset, leaving our real concerns brushed aside or minimised. Does
            it leave you feeling a bit anxious, unsure, and craving a holistic
            approach?
          </p>
        </div>
      </div>

      {/* ── The space ── */}
      <div className="about__banner">
        <p className="about__bannerText">
          Femved is the space just for you.
        </p>
      </div>

      {/* ── Conversation ── */}
      <div className="about__section about__section--conversation">
        <div className="about__prose">
          <p>
            Femved is the space just for you—where you can talk directly to
            experts, ask your questions, get real answers, and finally connect
            the dots. This isn't your usual personalised wellness plan; it's a
            conversation.
          </p>
          <p>
            Our experts are here to guide you, aligning their wisdom with your
            life and your world.
          </p>
        </div>
      </div>

      {/* ── Real healing ── */}
      <div className="about__section about__section--healing">
        <div className="about__prose">
          <p>
            It's not just about{" "}
            <em className="about__highlight">"You have PCOS? Take this."</em>
          </p>
          <p>
            It's about helping you truly heal—inside and out. This is more than
            a solution—it's part of creating{" "}
            <strong className="about__emphasis">real change.</strong>
          </p>
        </div>
      </div>

      {/* ── Closing ── */}
      <div className="about__closing">
        <p className="about__closingText">
          If this hits home, we're here to make sure you're seen, heard, and
          supported on this journey.
        </p>
      </div>
    </section>
  );
}
