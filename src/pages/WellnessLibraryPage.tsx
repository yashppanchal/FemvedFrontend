import "./WellnessLibraryPage.scss";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCountry } from "../country/useCountry";
import Placeholder from "./Placeholder";

/** Flip to false to show "Coming Soon" instead of the live library. */
const LIBRARY_LIVE = false;
import {
  getLibrarySnapshot,
  loadLibraryTree,
} from "../data/libraryPrograms";
import type {
  LibraryTreeResponse,
  LibraryVideoCardDto,
  LibraryCategoryDto,
} from "../api/library";
import FilterTabs from "../components/library/FilterTabs";
import FeaturedRow from "../components/library/FeaturedRow";
import LibraryCard from "../components/library/LibraryCard";

/** Maps a video id to its parent category slug for card links. */
function buildCategorySlugMap(
  categories: LibraryCategoryDto[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const cat of categories) {
    for (const vid of cat.videos) {
      map.set(vid.videoId, cat.categorySlug);
    }
  }
  return map;
}

/** Filters videos by category slug and video type. */
function applyFilters(
  tree: LibraryTreeResponse,
  categorySlug: string,
  videoType: string,
): LibraryVideoCardDto[] {
  let videos: LibraryVideoCardDto[];

  if (categorySlug === "all") {
    videos = tree.categories.flatMap((c) => c.videos);
  } else {
    const cat = tree.categories.find((c) => c.categorySlug === categorySlug);
    videos = cat?.videos ?? [];
  }

  if (videoType !== "all") {
    videos = videos.filter((v) => v.videoType === videoType);
  }

  return videos;
}

export default function WellnessLibraryPage() {
  if (!LIBRARY_LIVE) {
    return <Placeholder title="Wellness Library" description="Coming Soon" />;
  }

  const { country } = useCountry();

  const [tree, setTree] = useState<LibraryTreeResponse | null>(() =>
    getLibrarySnapshot(country),
  );
  const [loading, setLoading] = useState(() => getLibrarySnapshot(country) === null);
  const [hasError, setHasError] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeType, setActiveType] = useState("all");

  useEffect(() => {
    let isActive = true;
    setHasError(false);

    const snapshot = getLibrarySnapshot(country);
    if (snapshot) {
      setTree(snapshot);
      setLoading(false);
    } else {
      setTree(null);
      setLoading(true);
    }

    loadLibraryTree(country)
      .then((data) => {
        if (isActive) {
          setTree(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isActive) {
          if (!snapshot) setHasError(true);
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [country]);

  // Reset filters when country changes
  useEffect(() => {
    setActiveCategory("all");
    setActiveType("all");
  }, [country]);

  const filteredVideos = useMemo(
    () => (tree ? applyFilters(tree, activeCategory, activeType) : []),
    [tree, activeCategory, activeType],
  );

  const categorySlugMap = useMemo(
    () => (tree ? buildCategorySlugMap(tree.categories) : new Map<string, string>()),
    [tree],
  );

  const showFeatured =
    activeCategory === "all" &&
    activeType === "all" &&
    (tree?.featuredVideos.length ?? 0) > 0;

  if (loading) {
    return (
      <section className="page wellnessLibraryPage">
        <h1 className="page__title">Loading Wellness Library...</h1>
      </section>
    );
  }

  if (hasError || !tree) {
    return (
      <section className="page wellnessLibraryPage">
        <h1 className="page__title">Unable to load the Wellness Library</h1>
        <p className="page__lead">
          Please refresh and try again. You can also go back{" "}
          <Link to="/">home</Link>.
        </p>
      </section>
    );
  }

  return (
    <section className="page wellnessLibraryPage">
      <header className="wellnessLibraryPage__header">
        <h1 className="page__title">
          {tree.domain.domainName || "Wellness Library"}
        </h1>
        <p className="page__lead">
          Expert-led recorded programs you can watch at your own pace.
          One-time purchase, lifetime access.
        </p>
      </header>

      {tree.categories.length > 0 && (
        <FilterTabs
          categories={tree.categories}
          activeCategory={activeCategory}
          activeType={activeType}
          onCategoryChange={setActiveCategory}
          onTypeChange={setActiveType}
        />
      )}

      {showFeatured && (
        <FeaturedRow
          videos={tree.featuredVideos}
          categories={tree.categories}
        />
      )}

      {filteredVideos.length > 0 ? (
        <>
          <p className="wellnessLibraryPage__resultsCount">
            {filteredVideos.length} program{filteredVideos.length !== 1 ? "s" : ""}
          </p>
          <div className="wellnessLibraryPage__grid">
            {filteredVideos.map((video) => (
              <LibraryCard
                key={video.videoId}
                video={video}
                categorySlug={categorySlugMap.get(video.videoId) ?? "video"}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="card wellnessLibraryPage__emptyState">
          <h2 className="card__title">No programs match this filter</h2>
          <p className="card__text">
            Try selecting a different filter above.
          </p>
        </div>
      )}
    </section>
  );
}
