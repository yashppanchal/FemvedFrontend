import { useEffect, useState } from "react";
import { fetchPublicExperts } from "../api/experts";
import type { PublicExpert } from "../api/experts";
import RevealOnScroll from "../components/RevealOnScroll";
import "./KnowYourExperts.scss";

export default function KnowYourExperts() {
  const [experts, setExperts] = useState<PublicExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicExperts()
      .then((data) => {
        setExperts(data.filter((e) => e.isActive && !e.isDeleted));
      })
      .catch(() =>
        setError("Unable to load experts right now. Please try again later."),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="page experts">
      {/* ── Hero ── */}
      <RevealOnScroll className="experts__hero">
        <p className="experts__heroLabel">Learn</p>
        <h1 className="experts__heroTitle">Know Your Experts</h1>
      </RevealOnScroll>

      {/* ── Intro copy ── */}
      <RevealOnScroll className="experts__intro">
        <p className="experts__introText">
          Our doctors and practitioners hold certifications from globally
          recognised institutions and bring decades of combined clinical
          experience across holistic wellness and functional medicine. Every
          recommendation you receive is evidence informed, individually
          assessed, in an integrated format and delivered by a specialist who is
          fully qualified to guide your health in the right direction.
        </p>
      </RevealOnScroll>

      {/* ── States ── */}
      {loading && (
        <div className="experts__status">
          <span className="experts__spinner" aria-label="Loading experts" />
        </div>
      )}

      {!loading && error && (
        <div className="experts__status experts__status--error">
          <p>{error}</p>
        </div>
      )}

      {/* ── Expert grid ── */}
      {!loading && !error && (
        <RevealOnScroll className="experts__gridSection">
          <div className="experts__gridHeader">
            <p className="experts__sectionLabel">Our Practitioners</p>
            <h2 className="experts__sectionTitle">
              {/* Trusted experts, personalised care */}
              Internationally accredited experts in holistic wellness and
              functional medicine
            </h2>
          </div>

          {experts.length === 0 ? (
            <p className="experts__empty">
              No experts are available at the moment. Please check back soon.
            </p>
          ) : (
            <div className="experts__grid">
              {experts.map((expert) => {
                const image = expert.gridImageUrl || expert.profileImageUrl;
                const specialties = expert.specialisations ?? [];

                return (
                  <article key={expert.userEmail} className="expertCard">
                    {image && (
                      <div className="expertCard__imageWrap">
                        <img
                          className="expertCard__image"
                          src={image}
                          alt={expert.displayName}
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div className="expertCard__body">
                      <h2 className="expertCard__name">{expert.displayName}</h2>
                      <p className="expertCard__title">{expert.title}</p>

                      {expert.yearsExperience > 0 && (
                        <p className="expertCard__experience">
                          {expert.yearsExperience} years of experience
                        </p>
                      )}

                      <p className="expertCard__bio">
                        {expert.gridDescription || expert.bio}
                      </p>

                      {specialties.length > 0 && (
                        <div className="expertCard__specialties">
                          {specialties.map((s) => (
                            <span key={s} className="expertCard__tag">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </RevealOnScroll>
      )}
    </section>
  );
}
