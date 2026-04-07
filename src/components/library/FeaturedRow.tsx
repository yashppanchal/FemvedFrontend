import "./FeaturedRow.scss";
import { Link } from "react-router-dom";
import type { LibraryFeaturedVideoDto, LibraryCategoryDto } from "../../api/library";

interface FeaturedRowProps {
  videos: LibraryFeaturedVideoDto[];
  categories: LibraryCategoryDto[];
}

/** Resolves the category slug for a featured video so we can build the detail link. */
function findCategorySlug(
  videoId: string,
  categories: LibraryCategoryDto[],
): string {
  for (const cat of categories) {
    if (cat.videos.some((v) => v.videoId === videoId)) {
      return cat.categorySlug;
    }
  }
  return "video";
}

/** Finds the video slug from the categories tree. */
function findVideoSlug(
  videoId: string,
  categories: LibraryCategoryDto[],
): string | null {
  for (const cat of categories) {
    const match = cat.videos.find((v) => v.videoId === videoId);
    if (match) return match.slug;
  }
  return null;
}

export default function FeaturedRow({ videos, categories }: FeaturedRowProps) {
  if (videos.length === 0) return null;

  const sorted = [...videos].sort((a, b) => (a.position ?? 99) - (b.position ?? 99));

  return (
    <section className="featuredRow">
      <h2 className="featuredRow__heading">Featured</h2>
      <div className="featuredRow__grid">
        {sorted.slice(0, 3).map((video) => {
          const catSlug = findCategorySlug(video.videoId, categories);
          const vidSlug = findVideoSlug(video.videoId, categories) ?? video.videoId;
          const detailPath = `/wellness-library/${encodeURIComponent(catSlug)}/${encodeURIComponent(vidSlug)}`;
          const typeBadge = video.videoType === "SERIES" ? "Series" : "Masterclass";

          return (
            <Link key={video.videoId} to={detailPath} className="featuredRow__card">
              <div className="featuredRow__imageWrap">
                {video.cardImage ? (
                  <img
                    src={video.cardImage}
                    alt={video.title}
                    className="featuredRow__image"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className={`featuredRow__gradient ${video.gradientClass ?? "grad-default"}`}
                    aria-hidden="true"
                  >
                    {video.iconEmoji && (
                      <span className="featuredRow__emoji">{video.iconEmoji}</span>
                    )}
                  </div>
                )}
                <span className="featuredRow__typeBadge">{typeBadge}</span>
              </div>

              <div className="featuredRow__body">
                {video.eyebrowText && (
                  <p className="featuredRow__eyebrow">{video.eyebrowText}</p>
                )}
                <h3 className="featuredRow__title">{video.title}</h3>
                <p className="featuredRow__expert">{video.expertName}</p>

                <div className="featuredRow__meta">
                  {video.totalDuration && (
                    <span>{video.totalDuration}</span>
                  )}
                  {video.episodeCount != null && video.episodeCount > 0 && (
                    <span>
                      {video.episodeCount} ep{video.episodeCount !== 1 ? "s" : ""}
                    </span>
                  )}
                  <span className="featuredRow__price">{video.price}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
