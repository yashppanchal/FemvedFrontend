import { useEffect, useRef, useState } from "react";
import { FaPlay } from "react-icons/fa";
import "./PodcastSection.scss";

type PodcastEpisode = {
  id: string;
  videoId: string;
  title: string;
  guest: string;
  duration: string;
};

const featuredEpisode = {
  videoId: "b6LoEssJ4Gs",
  title: "Welcome to the HER daily Rhythm podcast.",
};

const episodes: PodcastEpisode[] = [
  {
    id: "ep-1",
    videoId: "-eQH5j0iCkM",
    title:
      "HOW TO FIND HORMONAL BALANCE: Integrating Eastern and Western Wisdom in Women's Health",
    guest: "Hormonal Balance",
    duration: "47m",
  },
  {
    id: "ep-2",
    videoId: "yXjYWq1OPqY",
    title:
      "28 Days to Balanced Hormones | Natural Hormone Health for Women with Kimberly Parsons",
    guest: "Kimberly Parsons",
    duration: "1h 20m",
  },
  {
    id: "ep-3",
    videoId: "BTnBTlePexE",
    title: "How to Overcome Period Pain – No, It's Not Normal!",
    guest: "Sivaranjani Ganapathy",
    duration: "1h 7m",
  },
];

export function PodcastSection() {
  const playerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = playerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // only trigger once
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="podcastSection">
      <div className="podcastSection__inner">
        {/* ─── Left: Featured episode ─── */}
        <div className="podcastSection__featured">
          <div className="podcastSection__player" ref={playerRef}>
            {isVisible && (
              <iframe
                className="podcastSection__iframe"
                src={`https://www.youtube.com/embed/${featuredEpisode.videoId}?autoplay=1&mute=1`}
                title={featuredEpisode.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            )}
          </div>

          <p className="podcastSection__description">
            Here, we explore how you can tap into your wellness—whether it's
            through nutrition, self-care, or mindfulness practices. Expect real
            talk from women's health experts who've been in your shoes, sharing
            their wisdom to help you feel more in tune with yourself.
          </p>
        </div>

        {/* ─── Right: Episode list ─── */}
        <div className="podcastSection__list">
          <h2 className="podcastSection__heading">
            Best of <span className="podcastSection__headingSep">|</span> Her
            Daily Rhythm Podcast
          </h2>

          <div className="podcastSection__episodes">
            {episodes.map((ep) => (
              <div key={ep.id} className="podcastSection__episode">
                <img
                  className="podcastSection__avatar"
                  src={`https://img.youtube.com/vi/${ep.videoId}/hqdefault.jpg`}
                  alt={ep.guest}
                  loading="lazy"
                  decoding="async"
                />

                <div className="podcastSection__episodeBody">
                  <span className="podcastSection__duration">
                    {ep.duration}
                  </span>
                  <p className="podcastSection__guest">{ep.title}</p>
                  <div className="podcastSection__episodeActions">
                    <a
                      href={`https://www.youtube.com/watch?v=${ep.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="podcastSection__listenBtn"
                      aria-label={`Listen to ${ep.guest}`}
                    >
                      <FaPlay className="podcastSection__listenIcon" />
                      Listen
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
