import "./LibraryDetailPage.scss";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiShare2 } from "react-icons/fi";
import { useCountry } from "../country/useCountry";
import {
  fetchVideoBySlug,
  type LibraryVideoDetailResponse,
} from "../api/library";
import TrailerEmbed from "../components/library/TrailerEmbed";
import EpisodeList from "../components/library/EpisodeList";
import PurchaseCard from "../components/library/PurchaseCard";
import InstructorStrip from "../components/library/InstructorStrip";

function detailEyebrow(video: LibraryVideoDetailResponse): string {
  if (video.tags.length > 0) {
    return video.tags[0].toUpperCase();
  }
  return video.videoType === "SERIES" ? "SERIES" : "MASTERCLASS";
}

function formatMetaLine(video: LibraryVideoDetailResponse): string | null {
  const parts: string[] = [];
  if (video.releaseYear) parts.push(String(video.releaseYear));
  if (video.totalDuration) parts.push(video.totalDuration);
  if (parts.length === 0) return null;
  return parts.join(" · ");
}

export default function LibraryDetailPage() {
  const navigate = useNavigate();
  const { videoSlug } = useParams<{
    categorySlug: string;
    videoSlug: string;
  }>();
  const { country } = useCountry();

  const [video, setVideo] = useState<LibraryVideoDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [shareHint, setShareHint] = useState<string | null>(null);

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

  const handleShare = useCallback(async () => {
    if (!video) return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: video.title, url });
        return;
      }
    } catch {
      // user cancelled or share failed — fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareHint("Link copied");
      window.setTimeout(() => setShareHint(null), 2000);
    } catch {
      setShareHint("Copy the address from your browser bar");
      window.setTimeout(() => setShareHint(null), 3000);
    }
  }, [video]);

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

  const posterSrc = video.heroImage ?? video.cardImage ?? null;
  const metaLine = formatMetaLine(video);

  return (
    <section className="page libraryDetailPage">
      <button
        type="button"
        className="libraryDetailPage__backBtn"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="libraryDetailPage__layout">
        <div className="libraryDetailPage__main">
          <div className="libraryDetailPage__mediaBlock">
            {video.trailerUrl ? (
              <TrailerEmbed trailerUrl={video.trailerUrl} title={video.title} />
            ) : posterSrc ? (
              <div className="libraryDetailPage__poster">
                <img src={posterSrc} alt="" />
              </div>
            ) : (
              <div
                className="libraryDetailPage__poster libraryDetailPage__poster--empty"
                aria-hidden
              />
            )}

            <div className="libraryDetailPage__mediaRow">
              {metaLine && (
                <p className="libraryDetailPage__mediaMeta">{metaLine}</p>
              )}
              <div className="libraryDetailPage__shareWrap">
                {shareHint && (
                  <span className="libraryDetailPage__shareHint" role="status">
                    {shareHint}
                  </span>
                )}
                <button
                  type="button"
                  className="libraryDetailPage__shareBtn"
                  onClick={handleShare}
                >
                  <FiShare2 aria-hidden className="libraryDetailPage__shareIcon" />
                  Share
                </button>
              </div>
            </div>

            {video.synopsis && (
              <p className="libraryDetailPage__lead">{video.synopsis}</p>
            )}
          </div>

          {video.description && (
            <div
              className="libraryDetailPage__description"
              dangerouslySetInnerHTML={{ __html: video.description }}
            />
          )}

          {video.episodes.length > 0 && (
            <EpisodeList
              episodes={video.episodes}
              isPurchased={video.isPurchased}
            />
          )}

          <InstructorStrip
            name={video.expertName}
            title={video.expertTitle}
            bio={video.expertGridDescription}
          />

          {video.testimonials.length > 0 && (
            <section className="libraryDetailPage__testimonials">
              <h2 className="libraryDetailPage__sectionHeading">
                What others are saying
              </h2>
              <div className="libraryDetailPage__testimonialGrid">
                {video.testimonials.map((t, i) => (
                  <blockquote key={i} className="libraryDetailPage__testimonial">
                    <div
                      className="libraryDetailPage__stars"
                      aria-label={`${t.rating} out of 5 stars`}
                    >
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

        <div className="libraryDetailPage__sidebar">
          <PurchaseCard
            videoId={video.videoId}
            title={video.title}
            eyebrow={detailEyebrow(video)}
            expertName={video.expertName}
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
