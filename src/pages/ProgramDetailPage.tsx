import "./ProgramDetailPage.scss";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useCountry } from "../country/useCountry";
import { useAuth } from "../auth/useAuth";
import {
  loadGuidedPrograms,
  normalizeSlug,
  type GuidedProgramInfo,
} from "../data/guidedPrograms";
import { initiateOrder } from "../api/orders";
import { hasValidAccessToken } from "../auth/useAuth";
import {
  buildCloudinarySrcSet,
  optimizeCloudinaryImageUrl,
} from "../cloudinary/image";

export default function ProgramDetailPage() {
  const { country: selectedCountryCode, isCountryReady } = useCountry();
  const { user, tokens } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { programSlug, programId } = useParams<{
    programSlug: string;
    programId: string;
  }>();
  const [categories, setCategories] = useState<GuidedProgramInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [selectedDurationLabel, setSelectedDurationLabel] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    if (!isCountryReady) return;

    let isActive = true;

    async function loadData() {
      setLoading(true);
      setHasError(false);

      try {
        const payload = await loadGuidedPrograms(selectedCountryCode);
        if (isActive) {
          setCategories(payload);
        }
      } catch {
        if (isActive) {
          setHasError(true);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isActive = false;
    };
  }, [isCountryReady, selectedCountryCode]);

  const selectedProgram = useMemo(() => {
    if (!programId) return null;

    const desiredCategorySlug = normalizeSlug(programSlug);
    const selectedCategory = categories.find((category) => {
      const mappedSlug = normalizeSlug(category.slug);
      return (
        mappedSlug === desiredCategorySlug || category.slug === programSlug
      );
    });

    if (!selectedCategory) return null;

    return (
      selectedCategory.programsInCategory?.find(
        (program) => program.programId === programId,
      ) ?? null
    );
  }, [categories, programId, programSlug]);

  useEffect(() => {
    const firstDurationLabel =
      selectedProgram?.programDurations?.[0]?.durationLabel ?? "";
    setSelectedDurationLabel(firstDurationLabel);
  }, [selectedProgram]);

  const selectedDuration = useMemo(() => {
    if (!selectedProgram?.programDurations?.length) return null;

    return (
      selectedProgram.programDurations.find(
        (duration) => duration.durationLabel === selectedDurationLabel,
      ) ?? selectedProgram.programDurations[0]
    );
  }, [selectedDurationLabel, selectedProgram]);
  const programDurations = selectedProgram?.programDurations ?? [];
  const priceOptionsClassName = `programDetailPage__priceOptions${
    programDurations.length === 1
      ? " programDetailPage__priceOptions--single"
      : ""
  }`;
  const optimizedProgramHeroImage = optimizeCloudinaryImageUrl(
    selectedProgram?.imageUrl,
    { width: 1600, crop: "fill" },
  );
  const optimizedExpertImage = optimizeCloudinaryImageUrl(
    selectedProgram?.expertGridImageUrl,
    { width: 720, crop: "fill" },
  );
  const expertImageSrcSet = buildCloudinarySrcSet(
    selectedProgram?.expertGridImageUrl,
    [320, 480, 640, 720, 960],
    { crop: "fill" },
  );

  async function handleEnroll() {
    if (!selectedDuration) return;

    // Fix 3: check token validity, not just presence of user object
    if (!user || !hasValidAccessToken(tokens)) {
      navigate("/login", { state: { from: location } });
      return;
    }

    if (!selectedDuration.durationId) {
      setCheckoutError("This program duration is not available for purchase yet.");
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const gateway = selectedCountryCode === "IN" ? "CashFree" : "PayPal";
      const order = await initiateOrder({
        durationId: selectedDuration.durationId,
        countryCode: selectedCountryCode,
        gateway,
        idempotencyKey: crypto.randomUUID(),
      });

      if (order.gateway === "CASHFREE") {
        const { load } = await import("@cashfreepayments/cashfree-js");
        const mode =
          (import.meta.env.VITE_CASHFREE_MODE ?? "sandbox") as
          | "sandbox"
          | "production";
        const cashfree = await load({ mode });

        // Fix 1: inspect checkout() result — don't navigate if user cancelled
        const result = await cashfree.checkout({
          paymentSessionId: order.paymentSessionId,
          redirectTarget: "_modal",
        });

        if (result?.error) {
          setCheckoutError(
            result.error.message ?? "Payment was not completed. Please try again.",
          );
          return;
        }

        // Fix 4: pass returnTo so the processing page can navigate back reliably
        const returnTo = encodeURIComponent(window.location.pathname);
        navigate(
          `/payment/processing?orderId=${encodeURIComponent(order.orderId)}&returnTo=${returnTo}`,
        );
      } else if (order.gateway === "PAYPAL") {
        if (!order.approvalUrl) {
          setCheckoutError("PayPal checkout link is missing. Please try again.");
          return;
        }
        window.location.assign(order.approvalUrl);
      } else {
        setCheckoutError("Unexpected payment gateway. Please try again or contact support.");
      }
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : "Failed to initiate payment. Please try again.",
      );
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="page programDetailPage">
        <h1 className="page__title">Loading program...</h1>
      </section>
    );
  }

  if (hasError) {
    return (
      <section className="page programDetailPage">
        <h1 className="page__title">Unable to load program</h1>
        <p className="page__lead">
          Please refresh and try again. Go back to <Link to="/">home</Link>.
        </p>
      </section>
    );
  }

  if (!selectedProgram) {
    return (
      <section className="page programDetailPage">
        <h1 className="page__title">Program not found</h1>
        <p className="page__lead">
          This program does not exist yet. Go back to <Link to="/">home</Link>.
        </p>
      </section>
    );
  }

  return (
    <section className="page programDetailPage">
      <header
        className="programDetailPage__hero"
        style={
          selectedProgram.imageUrl
            ? {
                backgroundImage: `linear-gradient(rgba(15, 15, 16, 0.35), rgba(15, 15, 16, 0.45)), url("${optimizedProgramHeroImage}")`,
              }
            : undefined
        }
      >
        <div className="programDetailPage__heroInner container">
          <button
            type="button"
            className="programDetailPage__backButton"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <h1 className="programDetailPage__title">
            {selectedProgram.programName}
          </h1>
          <p className="programDetailPage__meta">
            By <strong>{selectedProgram.expertName}</strong>
          </p>
        </div>
      </header>

      <div className="programDetailPage__contentWrap container">
        <article className="programDetailPage__content">
          <p>{selectedProgram.programPageDisplayDetails?.overview}</p>
          <h3>
            {
              selectedProgram.programPageDisplayDetails?.detailSections?.[0]
                ?.heading
            }
          </h3>
          <p>
            {
              selectedProgram.programPageDisplayDetails?.detailSections?.[0]
                ?.description
            }
          </p>
          <h2>What you'll receive in this program:</h2>
          <ul>
            {selectedProgram.programPageDisplayDetails?.whatYouGet?.map(
              (item) => (
                <li key={item}>{item}</li>
              ),
            )}
          </ul>
          <h2>Who should join this program:</h2>
          <ul>
            {selectedProgram.programPageDisplayDetails?.whoIsThisFor?.map(
              (item) => (
                <li key={item}>{item}</li>
              ),
            )}
          </ul>
        </article>

        <aside className="programDetailPage__stickyCard">
          <p>Course Fee:</p>
          <h3 className="programDetailPage__priceTitle">
            {selectedDuration?.durationPrice ?? ""}
          </h3>
          <hr className="programDetailPage__priceDivider" />
          <div className={priceOptionsClassName}>
            {programDurations.map((duration) => {
              const isActive = duration.durationLabel === selectedDurationLabel;
              const durationButtonClassName = `programDetailPage__priceBtn${
                isActive ? " programDetailPage__priceBtn--active" : ""
              }`;
              return (
                <button
                  key={duration.durationLabel}
                  type="button"
                  className={durationButtonClassName}
                  onClick={() =>
                    setSelectedDurationLabel(duration.durationLabel)
                  }
                  aria-pressed={isActive}
                >
                  {duration.durationLabel}
                </button>
              );
            })}
          </div>
          <ul className="programDetailPage__stickyPointers">
            <li>Personalized plan</li>
            <li>Complete privacy</li>
            <li>Client-Expert confidentiality</li>
          </ul>
          {checkoutError && (
            <p className="programDetailPage__checkoutError">{checkoutError}</p>
          )}
          <button
            type="button"
            className="button programDetailPage__enrollButton"
            onClick={handleEnroll}
            disabled={checkoutLoading || !selectedDuration}
          >
            {checkoutLoading ? "Processing…" : "Enroll Now"}
          </button>
        </aside>
      </div>

      <section className="programDetailPage__expertSection">
        <div className="programDetailPage__expertInner container">
          <div className="programDetailPage__expertLeft">
            {selectedProgram.expertGridImageUrl ? (
              <img
                src={optimizedExpertImage}
                srcSet={expertImageSrcSet}
                sizes="(max-width: 768px) 92vw, 420px"
                alt={selectedProgram.expertName}
                className="programDetailPage__expertPhoto"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div
                className="programDetailPage__expertPhotoFallback"
                aria-hidden="true"
              >
                {selectedProgram.expertName.charAt(0)}
              </div>
            )}
            <div className="programDetailPage__expertOverlay">
              <h3 className="programDetailPage__expertName">
                {selectedProgram.expertName}
              </h3>
              <p className="programDetailPage__expertTitle">
                {selectedProgram.expertTitle}
              </p>
            </div>
          </div>
          <div className="programDetailPage__expertRight">
            <p>{selectedProgram.expertDetailedDescription}</p>
          </div>
        </div>
      </section>
    </section>
  );
}
