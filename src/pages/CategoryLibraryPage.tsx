import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCountry } from "../country/useCountry";
import { fetchLibraryCategory, type LibraryCategoryDto } from "../api/library";
import { LoadingScreen } from "../components/LoadingScreen";
import LibraryCard from "../components/library/LibraryCard";
import { usePageTitle } from "../usePageTitle";
import "./WellnessLibraryPage.scss";

export default function CategoryLibraryPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { country } = useCountry();

  const [category, setCategory] = useState<LibraryCategoryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  usePageTitle(category?.categoryName ?? "Category");

  useEffect(() => {
    if (!categorySlug) return;

    let isActive = true;
    setLoading(true);
    setHasError(false);

    const apiCountryCode = country === "UK" ? "GB" : country;

    fetchLibraryCategory(categorySlug, apiCountryCode)
      .then((data) => {
        if (isActive) {
          setCategory(data);
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
  }, [categorySlug, country]);

  if (loading) {
    return (
      <section className="page wellnessLibraryPage">
        <LoadingScreen message="Loading…" />
      </section>
    );
  }

  if (hasError || !category) {
    return (
      <section className="page wellnessLibraryPage">
        <h1 className="page__title">Category not found</h1>
        <p className="page__lead">
          This category may have been removed or doesn't exist.{" "}
          <Link to="/wellness-library">Browse the library</Link>.
        </p>
      </section>
    );
  }

  return (
    <section className="page wellnessLibraryPage">
      {/* Breadcrumb */}
      <nav style={{ fontSize: 13, color: "rgba(15,15,16,0.55)", marginBottom: 16 }} aria-label="Breadcrumb">
        <Link to="/wellness-library" style={{ color: "var(--primary, #56131b)", textDecoration: "none" }}>
          Wellness Library
        </Link>
        <span aria-hidden="true"> / </span>
        <span>{category.categoryName}</span>
      </nav>

      <h1 className="page__title">{category.categoryName}</h1>
      <p className="page__lead">
        {category.videos.length} video{category.videos.length !== 1 ? "s" : ""} in this category.
      </p>

      {category.videos.length > 0 ? (
        <div className="wellnessLibraryPage__grid">
          {category.videos.map((video) => (
            <LibraryCard
              key={video.videoId}
              video={video}
              categorySlug={category.categorySlug}
            />
          ))}
        </div>
      ) : (
        <p className="page__lead">
          No videos available in this category yet.{" "}
          <Link to="/wellness-library">Browse all categories</Link>.
        </p>
      )}
    </section>
  );
}
