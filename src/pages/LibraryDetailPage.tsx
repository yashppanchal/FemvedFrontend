import "./LibraryDetailPage.scss";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCountry } from "../country/useCountry";
import { fetchVideoBySlug, type LibraryVideoDetailResponse } from "../api/library";
import TrailerEmbed from "../components/library/TrailerEmbed";
import EpisodeList from "../components/library/EpisodeList";
import PurchaseCard from "../components/library/PurchaseCard";
import InstructorStrip from "../components/library/InstructorStrip";

export default function LibraryDetailPage() {
  const { videoSlug } = useParams<{
    categorySlug: string;
    videoSlug: string;
  }>();
  const { country } = useCountry();

  const [video, setVideo] = useState<LibraryVideoDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!videoSlug) return;

    let isActive = true;
    setLoading(true);
    setHasError(false);

    const apiCountryCode = country === "UK" ? "GB" : country;

    fetchVideoBySlug(videoSlug, apiCountryCode)
      .then((data) => {
        if (isActive) {
          setVideo(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isActive) {
          setHasError(true);
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [videoSlug, country]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="page libraryDetailPage">
        <h1 className="page__title">Loading...</h1>
      </section>
    );
  }

  // ── Error / not found ──────────────────────────────────────────────────────
  if (hasError || !video) {
    return (
      <section className="page libraryDetailPage">
        <h1 className="page__title">Video not found</h1>
        <p className="page__lead">
          This video may have been removed or isn't available in your region.{" "}
          <Link to="/wellness-library">Browse the library</Link>.
        </p>
      </section>
    );
  }

  const typeBadge = video.videoType === "SERIES" ? "Series" : "Masterclass";

  return (
    <section className="page libraryDetailPage">
      {/* Breadcrumb */}
      <nav className="libraryDetailPage__breadcrumb" aria-label="Breadcrumb">
        <Link to="/wellness-library">Wellness Library</Link>
        <span aria-hidden="true"> / </span>
        <span>{video.title}</span>
      </nav>

      <div className="libraryDetailPage__layout">
        {/* ── Main column ───────────────────────────────────────────────── */}
        <div className="libraryDetailPage__main">
          {/* Hero area */}
          <header className="libraryDetailPage__hero">
            <div className="libraryDetailPage__badges">
              <span className="libraryDetailPage__typeBadge">{typeBadge}</span>
              {video.releaseYear && (
                <span className="libraryDetailPage__year">{video.releaseYear}</span>
              )}
            </div>

            <h1 className="libraryDetailPage__title">{video.title}</h1>

            {video.synopsis && (
              <p className="libraryDetailPage__synopsis">{video.synopsis}</p>
            )}

            <div className="libraryDetailPage__meta">
              <span>By <strong>{video.expertName}</strong></span>
              {video.totalDuration && <span>{video.totalDuration}</span>}
              {video.episodes.length > 0 && (
                <span>
                  {video.episodes.length} episode{video.episodes.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {video.tags.length > 0 && (
              <div className="libraryDetailPage__tags">
                {video.tags.map((tag) => (
                  <span className="libraryDetailPage__tag" key={tag}>{tag}</span>
                ))}
              </div>
            )}
          </header>

          {/* Trailer */}
          {video.trailerUrl && (
            <div className="libraryDetailPage__trailer">
              <TrailerEmbed trailerUrl={video.trailerUrl} title={video.title} />
            </div>
          )}

          {/* Description (HTML) */}
          {video.description && (
            <div
              className="libraryDetailPage__description"
              dangerouslySetInnerHTML={{ __html: video.description }}
            />
          )}

          {/* Episodes */}
          {video.episodes.length > 0 && (
            <EpisodeList
              episodes={video.episodes}
              isPurchased={video.isPurchased}
            />
          )}

          {/* Instructor */}
          <InstructorStrip
            name={video.expertName}
            title={video.expertTitle}
            bio={video.expertGridDescription}
          />

          {/* Testimonials */}
          {video.testimonials.length > 0 && (
            <section className="libraryDetailPage__testimonials">
              <h2 className="libraryDetailPage__sectionHeading">
                What others are saying
              </h2>
              <div className="libraryDetailPage__testimonialGrid">
                {video.testimonials.map((t, i) => (
                  <blockquote key={i} className="libraryDetailPage__testimonial">
                    <div className="libraryDetailPage__stars" aria-label={`${t.rating} out of 5 stars`}>
                      {"★".repeat(t.rating)}
                      {"☆".repeat(5 - t.rating)}
                    </div>
                    <p className="libraryDetailPage__reviewText">{t.reviewText}</p>
                    <footer className="libraryDetailPage__reviewer">
                      — {t.reviewerName}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        <div className="libraryDetailPage__sidebar">
          <PurchaseCard
            videoId={video.videoId}
            price={video.price}
            originalPrice={video.originalPrice}
            features={video.features}
            isPurchased={video.isPurchased}
            videoSlug={video.slug}
          />
        </div>
      </div>
    </section>
  );
}
