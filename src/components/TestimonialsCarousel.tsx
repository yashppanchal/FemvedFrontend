import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaMinus,
  FaPlus,
} from "react-icons/fa6";
import "./TestimonialsCarousel.scss";

type Testimonial = {
  id: string;
  location: string;
  body: string;
};

const AUTOPLAY_MS = 6000;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function hashToHue(input: string) {
  // Simple deterministic hash -> hue
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h % 360;
}

function getStepPx(scroller: HTMLElement): number {
  const firstCard = scroller.querySelector<HTMLElement>(
    "[data-testimonial-card]",
  );
  if (!firstCard) return Math.max(260, Math.floor(scroller.clientWidth * 0.8));
  const styles = window.getComputedStyle(scroller);
  const gapRaw = styles.gap || styles.columnGap || "0";
  const gap = Number.parseFloat(gapRaw) || 0;
  return firstCard.getBoundingClientRect().width + gap;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
  );
}

export function TestimonialsCarousel() {
  const testimonials = useMemo<Testimonial[]>(
    () => [
      {
        id: "paris",
        location: "Paris",
        body: "My experience with the consultations is fantastic!\n\nYour unique holistic approach to women’s health is changing so many lives!\n\nNot only is it deep expertise in Ayurveda, but also an understanding of our modern situations and a warm, human therapeutic presence. We need more of that! Thank you for all that you are doing.",
      },
      {
        id: "berlin",
        location: "Berlin",
        body: "Thank you so much for this wonderful opportunity! I’m thankful to have had access to all this knowledge.",
      },
      {
        id: "london",
        location: "London",
        body: "The internet is full of meditation and energy healing stuff, and yeah, I’ve tried all the apps too—still didn’t get what the hype was about. Pranic healing? Thought it was some kind of magic trick, tbh. But Mandira’s masterclass? Total game-changer.\n\nShe broke it down—like, the actual science and philosophy—and it finally clicked. It’s not about someone else waving their hands and “healing” you; it’s about going inward and doing the work yourself. Love that I didn’t fall for random trends and found something real. Big shoutout to FemVed for keeping it 100% authentic. If you’re curious, just do it—you won’t regret it!",
      },
      {
        id: "bangalore",
        location: "Bangalore",
        body: "After 7 years, 3 doctors, and trying every diet from keto to low-carb, I still couldn’t manage my PCOS. Talking to Dr. Prathima, to my surprise, was calming—she helped me see that suppressing my anger and the anxiety resulting from it resulted in chronic fatigue and hence aggravated my issue.\n\nJust a few small daily steps, paying attention to myself, and meditation really helped. It’s not that everything will be reversed overnight, but I feel better now. I am happy that she could relate with me and didn't make me feel uncomfortable.",
      },
      {
        id: "new-jersey",
        location: "New Jersey",
        body: "As a mother who has struggled with hormonal issues since my teenage years, I always worried about my daughter facing the same challenges. I felt overwhelmed and helpless, not knowing how to break the cycle.\n\nAttending Dr. Khyati's Nurturing New Beginnings masterclass was a turning point for me. Dr. Khyati’s warmth and practical insights made everything feel manageable. She helped me understand my daughter’s unique needs in ways I had never considered. For the first time, I feel hopeful and equipped to guide her toward a healthier, balanced menarche.",
      },
      {
        id: "manchester",
        location: "Manchester",
        body: "At 42, navigating menopause is no joke, and I appreciate how much awareness there is nowadays. My workplace has had multiple sessions on the topic, which is great—but honestly, the sheer amount of information left me completely overwhelmed.\n\nI’ve always been someone who follows a healthy lifestyle and does her research, but even then, I found myself unsure of where to start. A friend recommended FemVed, and I decided to try their subscription plan—it felt like a low-risk way to see if it would help. And it did. It really did.\n\nThe practitioners on the platform are knowledgeable and trustworthy, and their guidance brought me the clarity I desperately needed. My advice? Skip the noise and trust the experts here—they’re doing a fantastic job.",
      },
    ],
    [],
  );

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const isAutoPaused = isPaused || expandedId != null;

  const syncNavState = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    const left = el.scrollLeft;

    setCanPrev(left > 2);
    setCanNext(left < max - 2);

    const step = getStepPx(el);
    const idx = clamp(Math.round(left / step), 0, testimonials.length - 1);
    setActiveIndex(idx);
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    syncNavState();

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        syncNavState();
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", syncNavState);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", syncNavState);
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testimonials.length]);

  useEffect(() => {
    if (isAutoPaused) return;
    if (prefersReducedMotion()) return;

    const el = scrollerRef.current;
    if (!el) return;

    const id = window.setInterval(() => {
      const step = getStepPx(el);
      const max = Math.max(0, el.scrollWidth - el.clientWidth);
      const nextLeft = el.scrollLeft + step;
      el.scrollTo({
        left: nextLeft > max + 2 ? 0 : nextLeft,
        behavior: "smooth",
      });
    }, AUTOPLAY_MS);

    return () => window.clearInterval(id);
  }, [isAutoPaused]);

  const scrollByCards = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = getStepPx(el);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const toggleExpanded = (id: string, cardEl?: HTMLElement | null) => {
    setExpandedId((cur) => (cur === id ? null : id));
    if (cardEl) {
      cardEl.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "nearest",
        inline: "start",
      });
    }
  };

  return (
    <section
      className="testimonialsCarousel"
      aria-label="Testimonials"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className="container">
        <div className="testimonialsCarousel__header">
          <div className="testimonialsCarousel__titleWrap">
            <h2 className="testimonialsCarousel__title">
              Stories from women who’ve experienced our expert-guided programs
            </h2>
            <p className="testimonialsCarousel__lead">
              Real experiences from consultations, masterclasses, and guided
              support across life stages.
            </p>
          </div>

          <div className="testimonialsCarousel__controls" aria-label="Controls">
            <button
              type="button"
              className="testimonialsCarousel__arrow"
              aria-label="Previous testimonials"
              onClick={() => scrollByCards(-1)}
              disabled={!canPrev}
            >
              <FaChevronLeft aria-hidden="true" />
            </button>
            <button
              type="button"
              className="testimonialsCarousel__arrow"
              aria-label="Next testimonials"
              onClick={() => scrollByCards(1)}
              disabled={!canNext}
            >
              <FaChevronRight aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div
        className="testimonialsCarousel__rail"
        aria-label="Testimonial cards"
      >
        <div
          ref={scrollerRef}
          className="testimonialsCarousel__scroller"
          role="group"
          aria-roledescription="carousel"
          aria-label="Testimonials carousel"
          aria-live={isAutoPaused ? "off" : "polite"}
          aria-atomic="true"
        >
          {testimonials.map((t) => {
            const hue = hashToHue(t.location);
            const hue2 = (hue + 34) % 360;
            const isExpanded = expandedId === t.id;
            return (
              <article
                key={t.id}
                className={`testimonialsCarousel__card ${
                  isExpanded ? "testimonialsCarousel__card--expanded" : ""
                }`}
                data-testimonial-card
                style={
                  {
                    ["--tc-h1" as never]: `${hue}deg`,
                    ["--tc-h2" as never]: `${hue2}deg`,
                  } as CSSProperties
                }
                aria-label={`Testimonial from ${t.location}`}
              >
                <div className="testimonialsCarousel__pills">
                  <span className="testimonialsCarousel__pill">
                    From {t.location}
                  </span>
                </div>

                <p className="testimonialsCarousel__quote">{t.body}</p>

                <button
                  type="button"
                  className="testimonialsCarousel__expand"
                  aria-label={
                    isExpanded
                      ? `Collapse testimonial from ${t.location}`
                      : `Expand testimonial from ${t.location}`
                  }
                  aria-expanded={isExpanded}
                  onClick={(e) => {
                    const cardEl = (e.currentTarget as HTMLElement).closest(
                      "[data-testimonial-card]",
                    ) as HTMLElement | null;
                    toggleExpanded(t.id, cardEl);
                  }}
                >
                  {isExpanded ? (
                    <FaMinus aria-hidden="true" />
                  ) : (
                    <FaPlus aria-hidden="true" />
                  )}
                </button>
              </article>
            );
          })}
        </div>

        <div className="testimonialsCarousel__dots" aria-label="Position">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              type="button"
              className={`testimonialsCarousel__dot ${
                i === activeIndex ? "testimonialsCarousel__dot--active" : ""
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
              aria-current={i === activeIndex}
              onClick={() => {
                const el = scrollerRef.current;
                if (!el) return;
                const step = getStepPx(el);
                el.scrollTo({ left: step * i, behavior: "smooth" });
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
