import { useState } from "react";
import type { LibraryStreamEpisodeDto } from "../../api/library";
import VideoPlayer from "./VideoPlayer";
import "./EpisodePlayer.scss";

interface EpisodePlayerProps {
  episodes: LibraryStreamEpisodeDto[];
  videoTitle: string;
}

/**
 * Series player — an episode list on the left and a YouTube iframe on the right.
 * The first episode is selected by default.
 */
export default function EpisodePlayer({ episodes, videoTitle }: EpisodePlayerProps) {
  const sorted = [...episodes].sort((a, b) => a.episodeNumber - b.episodeNumber);
  const [selectedId, setSelectedId] = useState<string | null>(
    sorted.length > 0 ? sorted[0].episodeId : null,
  );

  if (sorted.length === 0) {
    return (
      <p className="episodePlayer__empty">No episodes available for this series.</p>
    );
  }

  const selected = sorted.find((e) => e.episodeId === selectedId) ?? sorted[0];

  return (
    <div className="episodePlayer">
      <div className="episodePlayer__main">
        {selected.streamUrl ? (
          <VideoPlayer
            streamUrl={selected.streamUrl}
            title={`${videoTitle} — ${selected.title}`}
          />
        ) : (
          <div className="episodePlayer__missing">
            Stream unavailable for this episode.
          </div>
        )}
        <h2 className="episodePlayer__nowPlaying">
          <span className="episodePlayer__epNum">Episode {selected.episodeNumber}</span>
          {selected.title}
        </h2>
        {selected.description && (
          <p className="episodePlayer__desc">{selected.description}</p>
        )}
      </div>

      <ol className="episodePlayer__list">
        {sorted.map((ep) => {
          const isActive = ep.episodeId === selected.episodeId;
          return (
            <li key={ep.episodeId}>
              <button
                type="button"
                className={`episodePlayer__item${isActive ? " episodePlayer__item--active" : ""}`}
                onClick={() => setSelectedId(ep.episodeId)}
              >
                <span className="episodePlayer__itemNum">{ep.episodeNumber}</span>
                <span className="episodePlayer__itemText">
                  <span className="episodePlayer__itemTitle">{ep.title}</span>
                  {ep.isCompleted && (
                    <span className="episodePlayer__itemBadge">Completed</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
