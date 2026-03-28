import { useEffect, useRef, useState } from "react";
import { FaPlay, FaYoutube } from "react-icons/fa";
import "./Podcast.scss";
import RevealOnScroll from "../components/RevealOnScroll";

type Episode = {
  id: string;
  videoId: string;
  title: string;
  guest: string;
  duration: string;
};

const featuredEpisode = {
  videoId: "b6LoEssJ4Gs",
  title: "Welcome to the HER Daily Rhythm Podcast",
};

const episodes: Episode[] = [
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

function FeaturedPlayer({ videoId, title }: { videoId: string; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="podcast__featuredPlayer" ref={ref}>
      {visible && (
        <iframe
          className="podcast__featuredIframe"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      )}
    </div>
  );
}

function EpisodeCard({ ep }: { ep: Episode }) {
  const [playing, setPlaying] = useState(false);

  return (
    <RevealOnScroll className="podcast__episode">
      <div className="podcast__episodeThumbnail">
        {playing ? (
          <iframe
            className="podcast__episodeIframe"
            src={`https://www.youtube.com/embed/${ep.videoId}?autoplay=1`}
            title={ep.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <>
            <img
              src={`https://img.youtube.com/vi/${ep.videoId}/hqdefault.jpg`}
              alt={ep.title}
              loading="lazy"
              decoding="async"
              className="podcast__episodeThumb"
            />
            <button
              className="podcast__episodePlayBtn"
              onClick={() => setPlaying(true)}
              aria-label={`Play: ${ep.title}`}
            >
              <FaPlay />
            </button>
          </>
        )}
      </div>
      <div className="podcast__episodeMeta">
        <span className="podcast__episodeDuration">{ep.duration}</span>
        <p className="podcast__episodeTitle">{ep.title}</p>
        <a
          href={`https://www.youtube.com/watch?v=${ep.videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="podcast__episodeListen"
        >
          <FaPlay className="podcast__episodeListenIcon" />
          Watch on YouTube
        </a>
      </div>
    </RevealOnScroll>
  );
}

export default function Podcast() {
  return (
    <section className="page podcast">

      {/* ── Hero ── */}
      <RevealOnScroll className="podcast__hero">
        <p className="podcast__heroLabel">Tune In</p>
        <h1 className="podcast__heroTitle">Her Daily Rhythm Podcast</h1>
      </RevealOnScroll>

      {/* ── Intro copy + Subscribe ── */}
      <RevealOnScroll className="podcast__intro">
        <div className="podcast__introProse">
          <p>
            Join us as our host Natalie delves into transformative conversations
            on wellness, balance, and the rhythm of everyday life. Tune in to
            our podcast for compelling stories and actionable insights that will
            empower and elevate your daily routine.
          </p>
          <a
            className="podcast__subscribeBtn"
            href="https://www.youtube.com/@FemvedWellness"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaYoutube className="podcast__subscribeIcon" />
            Subscribe on YouTube
          </a>
        </div>
      </RevealOnScroll>

      {/* ── Featured episode ── */}
      <RevealOnScroll className="podcast__featuredSection">
        <div className="podcast__featuredInner">
          <p className="podcast__sectionLabel">Featured Episode</p>
          <h2 className="podcast__sectionTitle">{featuredEpisode.title}</h2>
          <FeaturedPlayer
            videoId={featuredEpisode.videoId}
            title={featuredEpisode.title}
          />
        </div>
      </RevealOnScroll>

      {/* ── Episode list ── */}
      <RevealOnScroll className="podcast__episodesSection">
        <div className="podcast__episodesInner">
          <p className="podcast__sectionLabel">Best Of</p>
          <h2 className="podcast__sectionTitle">Her Daily Rhythm Podcast</h2>
          <div className="podcast__episodesGrid">
            {episodes.map((ep) => (
              <EpisodeCard key={ep.id} ep={ep} />
            ))}
          </div>
        </div>
      </RevealOnScroll>

      {/* ── Subscribe CTA ── */}
      <RevealOnScroll className="podcast__cta">
        <p className="podcast__ctaText">
          New episodes every week — join the conversation.
        </p>
        <a
          className="podcast__subscribeBtn podcast__subscribeBtn--light"
          href="https://www.youtube.com/@FemvedWellness"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaYoutube className="podcast__subscribeIcon" />
          Subscribe on YouTube
        </a>
      </RevealOnScroll>

    </section>
  );
}
