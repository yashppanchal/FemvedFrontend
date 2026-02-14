import { useEffect, useMemo, useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";
import { PrimaryButton } from "./PrimaryButton";
import "./HeroCarousel.scss";
import firstscroll from "../assets/homepage/firstscroll.jpg";
import secondscroll from "../assets/homepage/secondscroll.jpg";

type Slide = {
  type: "split" | "image" | "healthcare";
  imageUrl: string;
  imageAlt: string;
  title?: string;
  body?: string;
  ctaLabel?: string;
  ctaTo?: string;
};

const AUTOPLAY_MS = 5000;

export function HeroCarousel() {
  const slides = useMemo<Slide[]>(
    () => [
      {
        type: "split",
        imageUrl: firstscroll,
        imageAlt: "Femved \u2014 holistic wellness",
        title:
          "Your health doesn\u2019t need another influencer. You deserve the right guidance.",
        body: "Create your own wellness plan with globally accredited women practitioners. Because wellness is not a trend, a hack, or a reel. It is personal. This is your body, your lifestyle, your geography, and your plan, so stop borrowing wellness from the internet.",
        ctaLabel: "Create your plan",
        ctaTo: "/about",
      },
      {
        type: "healthcare",
        imageUrl: secondscroll,
        imageAlt: "Reproductive health illustration",
      },
    ],
    [],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [isPaused, slides.length]);

  return (
    <section className="heroCarousel" aria-label="Featured">
      <div className="heroCarousel__viewport">
        <div
          className="heroCarousel__track"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((s, idx) => {
            if (s.type === "split") {
              return (
                <div
                  key={idx}
                  className="heroCarousel__slide heroCarousel__slide--split"
                  aria-hidden={activeIndex !== idx}
                >
                  <div className="heroCarousel__content">
                    <h2 className="heroCarousel__title">{s.title}</h2>
                    <p className="heroCarousel__body">{s.body}</p>
                    {s.ctaTo && s.ctaLabel ? (
                      <PrimaryButton label={s.ctaLabel} to={s.ctaTo} />
                    ) : null}
                  </div>

                  <div className="heroCarousel__media" aria-hidden="true">
                    <img
                      className="heroCarousel__image"
                      src={s.imageUrl}
                      alt={s.imageAlt}
                      loading="eager"
                      decoding="async"
                    />
                  </div>
                </div>
              );
            }

            if (s.type === "healthcare") {
              return (
                <div
                  key={idx}
                  className="heroCarousel__slide heroCarousel__slide--healthcare"
                  aria-hidden={activeIndex !== idx}
                >
                  <div className="hc__left">
                    <h2 className="hc__headline">
                      Here,
                      <br />
                      you own your <em>wellness.</em>
                    </h2>

                    <p className="hc__subheader">
                      Ancient science was always about the freedom to apply what
                      fits your unique personality.
                    </p>

                    <p className="hc__subtitle">Choose where to start</p>

                    <div className="hc__buttons">
                      <PrimaryButton label="Personalise my test" to="/test" />
                      <PrimaryButton label="Speak to an expert" to="/experts" />
                    </div>
                  </div>

                  <div className="hc__right" aria-hidden="true">
                    <img
                      className="hc__illustration"
                      src={s.imageUrl}
                      alt={s.imageAlt}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
              );
            }

            return (
              <div
                key={idx}
                className="heroCarousel__slide heroCarousel__slide--image"
                aria-hidden={activeIndex !== idx}
              >
                <img
                  className="heroCarousel__image heroCarousel__image--cover"
                  src={s.imageUrl}
                  alt={s.imageAlt}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="heroCarousel__controls" aria-label="Carousel controls">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`heroCarousel__dot ${
              i === activeIndex ? "heroCarousel__dot--active" : ""
            }`}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === activeIndex}
            onClick={() => setActiveIndex(i)}
          />
        ))}
        <span className="heroCarousel__sep" aria-hidden="true" />
        <button
          type="button"
          className="heroCarousel__toggle"
          aria-pressed={isPaused}
          aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
          onClick={() => setIsPaused((p) => !p)}
        >
          {isPaused ? (
            <FaPlay className="heroCarousel__toggleIcon" aria-hidden="true" />
          ) : (
            <FaPause className="heroCarousel__toggleIcon" aria-hidden="true" />
          )}
        </button>
      </div>
    </section>
  );
}
