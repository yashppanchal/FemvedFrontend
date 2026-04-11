import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchMyLibrary,
  fetchVideoStream,
  type MyLibraryResponse,
  type MyLibraryVideoDto,
  type LibraryStreamResponse,
} from "../../api/library";
import { ApiError } from "../../api/client";
import VideoPlayer from "../../components/library/VideoPlayer";
import { LoadingScreen } from "../../components/LoadingScreen";
import EpisodePlayer from "../../components/library/EpisodePlayer";
import "../MyLibraryPage.scss";

/**
 * User's purchased library videos + inline YouTube player.
 * Used both as a standalone page (/dashboard/library) and as a Dashboard tab.
 */
export default function LibraryTab() {
  const [library, setLibrary] = useState<MyLibraryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeVideo, setActiveVideo] = useState<MyLibraryVideoDto | null>(null);
  const [stream, setStream] = useState<LibraryStreamResponse | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyLibrary()
      .then((data) => setLibrary(data))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load your library.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeVideo) {
      setStream(null);
      return;
    }
    let isActive = true;
    setStream(null);
    setStreamError(null);
    setStreamLoading(true);
    fetchVideoStream(activeVideo.slug)
      .then((data) => {
        if (isActive) setStream(data);
      })
      .catch((err) => {
        if (isActive) {
          setStreamError(
            err instanceof ApiError ? err.message : "Failed to load stream.",
          );
        }
      })
      .finally(() => {
        if (isActive) setStreamLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [activeVideo]);

  if (loading) {
    return <LoadingScreen compact message="Loading your purchased videos…" />;
  }

  if (error) {
    return <p className="page__lead">{error}</p>;
  }

  const videos = library?.videos ?? [];

  if (videos.length === 0) {
    return (
      <p className="page__lead">
        You haven't purchased any videos yet.{" "}
        <Link to="/wellness-library">Browse the library</Link>.
      </p>
    );
  }

  return (
    <div className="myLibraryPage">
      <p className="page__lead">
        {videos.length} purchased video{videos.length !== 1 ? "s" : ""}.
      </p>

      {activeVideo && (
        <div className="myLibraryPage__player">
          <div className="myLibraryPage__playerHeader">
            <div>
              <h2 className="myLibraryPage__playerTitle">{activeVideo.title}</h2>
              <p className="myLibraryPage__playerMeta">
                {activeVideo.expertName}
                {activeVideo.totalDuration ? ` · ${activeVideo.totalDuration}` : ""}
              </p>
            </div>
            <button
              type="button"
              className="myLibraryPage__close"
              onClick={() => setActiveVideo(null)}
              aria-label="Close player"
            >
              ×
            </button>
          </div>

          {streamLoading && (
            <div className="myLibraryPage__status">
              <LoadingScreen compact message="Loading stream…" />
            </div>
          )}
          {streamError && <p className="myLibraryPage__status">{streamError}</p>}

          {stream && stream.videoType === "SERIES" && (
            <EpisodePlayer
              episodes={stream.episodes}
              videoTitle={activeVideo.title}
            />
          )}
          {stream && stream.videoType !== "SERIES" && stream.streamUrl && (
            <VideoPlayer streamUrl={stream.streamUrl} title={activeVideo.title} />
          )}
        </div>
      )}

      <div className="myLibraryPage__grid">
        {videos.map((video) => {
          const progressPct = progressPercent(video);
          return (
            <button
              key={video.videoId}
              type="button"
              className="myLibraryPage__card"
              onClick={() => setActiveVideo(video)}
            >
              <div className={`myLibraryPage__cardMedia ${video.gradientClass ?? "grad-default"}`}>
                {video.cardImage ? (
                  <img src={video.cardImage} alt="" className="myLibraryPage__cardImage" />
                ) : (
                  <span className="myLibraryPage__cardEmoji">{video.iconEmoji ?? "🎬"}</span>
                )}
                <span className="myLibraryPage__cardTypeBadge">
                  {video.videoType === "SERIES" ? "Series" : "Masterclass"}
                </span>
              </div>
              <div className="myLibraryPage__cardBody">
                <h3 className="myLibraryPage__cardTitle">{video.title}</h3>
                <p className="myLibraryPage__cardExpert">{video.expertName}</p>
                {video.totalDuration && (
                  <p className="myLibraryPage__cardMeta">{video.totalDuration}</p>
                )}
                {progressPct !== null && (
                  <div className="myLibraryPage__progress" aria-label={`${progressPct}% watched`}>
                    <div
                      className="myLibraryPage__progressBar"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function progressPercent(video: MyLibraryVideoDto): number | null {
  if (video.watchProgressSeconds <= 0) return null;
  const assumedTotal = (video.episodeCount ?? 1) * 60 * 30;
  const pct = Math.min(100, Math.round((video.watchProgressSeconds / assumedTotal) * 100));
  return pct > 0 ? pct : null;
}
