import { useEffect, useRef } from "react";
import "./Podcast.scss";
import RevealOnScroll from "../components/RevealOnScroll";

export default function Podcast() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="page podcast">
      {/* ── Hero ── */}
      <RevealOnScroll className="podcast__hero">
        <p className="podcast__heroLabel">Tune In</p>
        <h1 className="podcast__heroTitle">Her Daily Rhythm Podcast</h1>
      </RevealOnScroll>

      {/* ── Feature card ── */}
      <RevealOnScroll className="podcast__card">
        <div className="podcast__cardMedia">
          <video
            ref={videoRef}
            className="podcast__cardVideo"
            src="https://videos.pexels.com/video-files/6953935/6953935-uhd_2560_1440_30fps.mp4"
            poster="https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=600&q=80"
            muted
            loop
            playsInline
            preload="metadata"
          />
        </div>

        <div className="podcast__cardBody">
          <p className="podcast__cardText">
            Join us as our host Natalie delves into transformative conversations
            on wellness, balance, and the rhythm of everyday life. Tune in to
            our podcast for compelling stories and actionable insights that will
            empower and elevate your daily routine.
          </p>
          <a
            className="podcast__cardButton"
            href="https://www.youtube.com/@FemvedWellness"
            target="_blank"
            rel="noopener noreferrer"
          >
            Subscribe on YouTube
          </a>
        </div>
      </RevealOnScroll>
    </section>
  );
}
