import "./EpisodeList.scss";
import type { LibraryEpisodeDto } from "../../api/library";

interface EpisodeListProps {
  episodes: LibraryEpisodeDto[];
  isPurchased: boolean;
  /** Called when a non-purchaser taps a free-preview episode row — scroll to trailer and play. */
  onFreePreviewClick?: () => void;
}

export default function EpisodeList({
  episodes,
  isPurchased,
  onFreePreviewClick,
}: EpisodeListProps) {
  if (episodes.length === 0) return null;

  return (
    <section className="episodeList">
      <h2 className="episodeList__heading">
        Episodes ({episodes.length})
      </h2>
      <ol className="episodeList__items">
        {episodes.map((ep) => {
          const unlocked = isPurchased || ep.isFreePreview;
          const isFreePreviewRow = ep.isFreePreview && !isPurchased;
          const itemClass = `episodeList__item${unlocked ? "" : " episodeList__item--locked"}`;

          const rowInner = (
            <>
              <span className="episodeList__number">{ep.episodeNumber}</span>
              <div className="episodeList__info">
                <span className="episodeList__title">
                  {ep.title}
                  {isFreePreviewRow && (
                    <span className="episodeList__freeTag">Free preview</span>
                  )}
                </span>
                {ep.description && (
                  <p className="episodeList__desc">{ep.description}</p>
                )}
              </div>
              <span className="episodeList__duration">
                {ep.duration ?? ""}
              </span>
              {!unlocked && (
                <span className="episodeList__lock" aria-label="Locked">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
              )}
            </>
          );

          return (
            <li key={ep.episodeId} className="episodeList__row">
              {isFreePreviewRow && onFreePreviewClick ? (
                <button
                  type="button"
                  className={itemClass}
                  onClick={onFreePreviewClick}
                  aria-label={`${ep.title} — play free preview`}
                >
                  {rowInner}
                </button>
              ) : (
                <div className={itemClass}>{rowInner}</div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
