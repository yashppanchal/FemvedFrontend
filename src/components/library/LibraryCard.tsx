import "./LibraryCard.scss";
import { Link } from "react-router-dom";
import type { LibraryVideoCardDto } from "../../api/library";

interface LibraryCardProps {
  video: LibraryVideoCardDto;
  categorySlug: string;
}

export default function LibraryCard({ video, categorySlug }: LibraryCardProps) {
  const detailPath = `/wellness-library/${encodeURIComponent(categorySlug)}/${encodeURIComponent(video.slug)}`;
  const typeBadge = video.videoType === "SERIES" ? "Series" : "Masterclass";

  return (
    <article className="libraryCard">
      <Link to={detailPath} className="libraryCard__imageWrap">
        {video.cardImage ? (
          <img
            src={video.cardImage}
            alt={video.title}
            className="libraryCard__image"
            loading="lazy"
          />
        ) : (
          <div
            className={`libraryCard__gradient ${video.gradientClass ?? "grad-default"}`}
            aria-hidden="true"
          >
            {video.iconEmoji && (
              <span className="libraryCard__emoji">{video.iconEmoji}</span>
            )}
          </div>
        )}
        <span className="libraryCard__typeBadge">{typeBadge}</span>
      </Link>

      <div className="libraryCard__body">
        <div className="libraryCard__meta">
          {video.totalDuration && (
            <span className="libraryCard__duration">{video.totalDuration}</span>
          )}
          {video.episodeCount != null && video.episodeCount > 0 && (
            <span className="libraryCard__episodes">
              <span className="libraryCard__episodesSeparator">•</span>
              {video.episodeCount} episode{video.episodeCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <Link to={detailPath} className="libraryCard__titleLink">
          <h3 className="libraryCard__title">{video.title}</h3>
        </Link>
        {video.synopsis && (
          <p className="libraryCard__synopsis">{video.synopsis}</p>
        )}
        <p className="libraryCard__expert">
          By <strong>{video.expertName}</strong>
        </p>
        {video.tags.length > 0 && (
          <div className="libraryCard__tags">
            {video.tags.slice(0, 3).map((tag) => (
              <span className="libraryCard__tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="libraryCard__priceRow">
          <span className="libraryCard__price">{video.price}</span>
          {video.originalPrice && (
            <span className="libraryCard__originalPrice">
              {video.originalPrice}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
