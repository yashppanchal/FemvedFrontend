import "./EpisodeList.scss";
import type { LibraryEpisodeDto } from "../../api/library";

interface EpisodeListProps {
  episodes: LibraryEpisodeDto[];
  isPurchased: boolean;
}

export default function EpisodeList({ episodes, isPurchased }: EpisodeListProps) {
  if (episodes.length === 0) return null;

  return (
    <section className="episodeList">
      <h2 className="episodeList__heading">
        Episodes ({episodes.length})
      </h2>
      <ol className="episodeList__items">
        {episodes.map((ep) => {
          const unlocked = isPurchased || ep.isFreePreview;
          return (
            <li
              key={ep.episodeId}
              className={`episodeList__item${unlocked ? "" : " episodeList__item--locked"}`}
            >
              <span className="episodeList__number">{ep.episodeNumber}</span>
              <div className="episodeList__info">
                <span className="episodeList__title">
                  {ep.title}
                  {ep.isFreePreview && !isPurchased && (
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
            </li>
          );
        })}
      </ol>
    </section>
  );
}
