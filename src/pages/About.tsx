import "./About.scss";

export default function About() {
  return (
    <section className="page page--about">
      <h1 className="page__title">About Femved</h1>
      <p className="page__lead">
        Femved is a space built for women experts and practitioners — women who
        have walked through pain, found their way to heal, and now guide others.
      </p>

      <div className="card">
        <p className="card__text">
          Femved is also for women who choose awareness, independence, and
          self-work — healing generational patterns, reclaiming health, and
          embracing softness as strength on their own terms. We’re building the
          first global holistic wellness matchmaking platform for women owning
          their wellness.
        </p>
      </div>

      <div style={{ height: 14 }} />

      <div className="card">
        <h2 className="card__title">Our tone</h2>
        <p className="card__text">
          Deep pomegranate grounded with earthy brown: calm, rooted, and
          assured. Strength that’s felt deeply, not announced loudly — where
          courage and care coexist.
        </p>
      </div>
    </section>
  );
}
