import "./WellnessLibraryPage.scss";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCountry } from "../country/useCountry";
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

/** Maps a category slug from the video's parent category for card links. */
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

/** Applies the active filter key against the tree data. */
function applyFilter(
  tree: LibraryTreeResponse,
  filterKey: string,
): LibraryVideoCardDto[] {
  if (filterKey === "all") {
    return tree.categories.flatMap((c) => c.videos);
  }

  const filter = tree.filters.find((f) => f.filterKey === filterKey);
  if (!filter) return tree.categories.flatMap((c) => c.videos);

  if (filter.filterTarget === "VIDEO_TYPE") {
    const typeUpper = filterKey.toUpperCase();
    return tree.categories.flatMap((c) =>
      c.videos.filter((v) => v.videoType === typeUpper),
    );
  }

  if (filter.filterTarget === "CATEGORY") {
    const cat = tree.categories.find(
      (c) => c.categorySlug === filterKey || c.categoryName.toLowerCase() === filterKey.toLowerCase(),
    );
    return cat?.videos ?? [];
  }

  return tree.categories.flatMap((c) => c.videos);
}

export default function WellnessLibraryPage() {
  const { country } = useCountry();

  // Initialise synchronously from snapshot
  const [tree, setTree] = useState<LibraryTreeResponse | null>(() =>
    getLibrarySnapshot(country),
  );
  const [loading, setLoading] = useState(() => getLibrarySnapshot(country) === null);
  const [hasError, setHasError] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

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

  // Reset filter when country changes (in case category slugs differ)
  useEffect(() => {
    setActiveFilter("all");
  }, [country]);

  const filteredVideos = useMemo(
    () => (tree ? applyFilter(tree, activeFilter) : []),
    [tree, activeFilter],
  );

  const categorySlugMap = useMemo(
    () => (tree ? buildCategorySlugMap(tree.categories) : new Map<string, string>()),
    [tree],
  );

  const showFeatured = activeFilter === "all" && (tree?.featuredVideos.length ?? 0) > 0;

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="page wellnessLibraryPage">
        <h1 className="page__title">Loading Wellness Library...</h1>
      </section>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
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

  // ── Loaded ─────────────────────────────────────────────────────────────────
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

      {tree.filters.length > 0 && (
        <FilterTabs
          filters={tree.filters}
          activeKey={activeFilter}
          onSelect={setActiveFilter}
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
