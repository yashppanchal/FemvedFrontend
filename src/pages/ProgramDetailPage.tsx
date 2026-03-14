import "./ProgramDetailPage.scss";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useCountry } from "../country/useCountry";
import { useAuth, ROLE_ADMIN, ROLE_EXPERT } from "../auth/useAuth";
import {
  loadGuidedPrograms,
  normalizeSlug,
  type GuidedProgramInfo,
} from "../data/guidedPrograms";
import { initiateOrder } from "../api/orders";
import { ApiError } from "../api/client";
import { hasValidAccessToken } from "../auth/useAuth";
import {
  buildCloudinarySrcSet,
  optimizeCloudinaryImageUrl,
} from "../cloudinary/image";
import RevealOnScroll from "../components/RevealOnScroll";

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
  const priceOptionsClassName = `pdp__durationGrid${
    programDurations.length === 1 ? " pdp__durationGrid--single" : ""
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

    if (!user || !hasValidAccessToken(tokens)) {
      navigate("/login", { state: { from: location } });
      return;
    }

    if (!selectedDuration.durationId) {
      setCheckoutError(
        "This program duration is not available for purchase yet.",
      );
      return;
    }

    // Translate "UK" to ISO 3166-1 alpha-2 "GB" that the backend uses for pricing lookup
    const apiCountryCode = selectedCountryCode === "UK" ? "GB" : selectedCountryCode;

    // Non-India users choose between PayPal and Stripe on a dedicated page
    if (apiCountryCode !== "IN") {
      navigate("/payment/select-provider", {
        state: {
          durationId: selectedDuration.durationId,
          countryCode: apiCountryCode,
        },
      });
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const order = await initiateOrder({
        durationId: selectedDuration.durationId,
        countryCode: apiCountryCode,
        gateway: "CashFree",
        idempotencyKey: crypto.randomUUID(),
      });

      if (order.gateway === "CASHFREE") {
        const { load } = await import("@cashfreepayments/cashfree-js");
        const mode = (import.meta.env.VITE_CASHFREE_MODE ?? "sandbox") as
          | "sandbox"
          | "production";
        const cashfree = await load({ mode });

        const result = await cashfree.checkout({
          paymentSessionId: order.paymentSessionId,
          redirectTarget: "_modal",
        });

        if (result?.error) {
          setCheckoutError(
            result.error.message ??
              "Payment was not completed. Please try again.",
          );
          return;
        }

        const returnTo = encodeURIComponent(window.location.pathname);
        navigate(
          `/payment/processing?orderId=${encodeURIComponent(order.orderId)}&returnTo=${returnTo}`,
        );
      } else {
        setCheckoutError(
          "Unexpected payment gateway. Please try again or contact support.",
        );
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        const roleId = user?.role?.id;
        if (roleId === ROLE_ADMIN.id) {
          setCheckoutError(
            "Admin accounts cannot enrol in programs. Use a regular user account to purchase.",
          );
        } else if (roleId === ROLE_EXPERT.id) {
          setCheckoutError(
            "Expert accounts cannot enrol in programs as a client. If you need access, please contact an administrator.",
          );
        } else {
          setCheckoutError(
            "You do not have permission to enrol in this program. Please contact support if you think this is a mistake.",
          );
        }
      } else {
        setCheckoutError(
          err instanceof Error
            ? err.message
            : "Failed to initiate payment. Please try again.",
        );
      }
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="page pdp pdp--state">
        <div className="pdp__stateInner">
          <div className="pdp__stateSpinner" aria-label="Loading" />
          <p className="pdp__stateText">Loading program…</p>
        </div>
      </section>
    );
  }

  if (hasError) {
    return (
      <section className="page pdp pdp--state">
        <div className="pdp__stateInner">
          <h1 className="page__title">Unable to load program</h1>
          <p className="page__lead">
            Please refresh and try again. Go back to <Link to="/">home</Link>.
          </p>
        </div>
      </section>
    );
  }

  if (!selectedProgram) {
    return (
      <section className="page pdp pdp--state">
        <div className="pdp__stateInner">
          <h1 className="page__title">Program not found</h1>
          <p className="page__lead">
            This program does not exist yet. Go back to <Link to="/">home</Link>
            .
          </p>
        </div>
      </section>
    );
  }

  const details = selectedProgram.programPageDisplayDetails;
  const whatYouGet = details?.whatYouGet ?? [];
  const whoIsThisFor = details?.whoIsThisFor ?? [];
  const detailSections = details?.detailSections ?? [];

  return (
    <section className="page pdp">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <header className="pdp__hero">
        <div className="pdp__heroContent">
          <button
            type="button"
            className="pdp__backBtn"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <p className="pdp__heroEyebrow">Guided 1:1 Program</p>
          <h1 className="pdp__heroTitle">{selectedProgram.programName}</h1>
          <p className="pdp__heroByline">
            With <strong>{selectedProgram.expertName}</strong>
            {selectedProgram.expertTitle && (
              <span className="pdp__heroBylineSub">
                {" "}
                · {selectedProgram.expertTitle}
              </span>
            )}
          </p>
          {/* {selectedDuration && (
            <button
              type="button"
              className="button pdp__heroCtaBtn"
              onClick={handleEnroll}
              disabled={checkoutLoading}
            >
              {checkoutLoading
                ? "Processing…"
                : `Enroll — ${selectedDuration.durationPrice}`}
            </button>
          )} */}
        </div>

        <div className="pdp__heroMedia">
          {selectedProgram.imageUrl ? (
            <img
              src={optimizedProgramHeroImage}
              alt={selectedProgram.programName}
              className="pdp__heroImage"
              loading="eager"
            />
          ) : (
            <div className="pdp__heroMediaFallback" aria-hidden="true" />
          )}
        </div>
      </header>

      {/* ── Overview + Enroll Card ────────────────────────────────────── */}
      <section className="pdp__enrollBand">
        <div className="pdp__enrollLeft">
          {details?.overview && (
            <p className="pdp__overview">{details.overview}</p>
          )}
          {detailSections[0] && (
            <div className="pdp__firstDetail">
              <h3 className="pdp__firstDetailTitle">
                {detailSections[0].heading}
              </h3>
              <p className="pdp__firstDetailBody">
                {detailSections[0].description}
              </p>
            </div>
          )}
        </div>

        <aside className="pdp__enrollCard">
          <p className="pdp__enrollCardLabel">Course Fee</p>
          <div className="pdp__enrollCardPrice">
            {selectedDuration?.durationPrice ?? ""}
          </div>
          <hr className="pdp__enrollCardDivider" />

          <div className={priceOptionsClassName}>
            {programDurations.map((duration) => {
              const isActive = duration.durationLabel === selectedDurationLabel;
              return (
                <button
                  key={duration.durationLabel}
                  type="button"
                  className={`pdp__durationBtn${isActive ? " pdp__durationBtn--active" : ""}`}
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

          <ul className="pdp__trustList">
            <li>Personalized plan</li>
            <li>Complete privacy</li>
            <li>Client-Expert confidentiality</li>
          </ul>

          {checkoutError && (
            <p className="pdp__checkoutError">{checkoutError}</p>
          )}

          <button
            type="button"
            className="button pdp__enrollBtn"
            onClick={handleEnroll}
            disabled={checkoutLoading || !selectedDuration}
          >
            {checkoutLoading ? "Processing…" : "Enroll Now"}
          </button>
        </aside>
      </section>

      {/* ── What You'll Receive ───────────────────────────────────────── */}
      {whatYouGet.length > 0 && (
        <section className="pdp__benefitsSection">
          <div className="pdp__sectionIntro">
            <h2 className="pdp__sectionTitle">What you'll receive</h2>
          </div>
          <RevealOnScroll className="pdp__benefitGrid">
            {whatYouGet.map((item, idx) => (
              <div
                key={item}
                className="pdp__benefitItem"
                style={{ transitionDelay: `${idx * 70}ms` }}
              >
                <span className="pdp__benefitCheck" aria-hidden="true">
                  ✓
                </span>
                {item}
              </div>
            ))}
          </RevealOnScroll>
        </section>
      )}

      {/* ── Who Is This For ──────────────────────────────────────────── */}
      {whoIsThisFor.length > 0 && (
        <section className="pdp__whoSection">
          <div className="pdp__sectionIntro">
            <h2 className="pdp__sectionTitle">Who should join</h2>
          </div>
          <RevealOnScroll className="pdp__whoGrid">
            {whoIsThisFor.map((item, idx) => (
              <div
                key={item}
                className="pdp__whoItem"
                style={{ transitionDelay: `${idx * 70}ms` }}
              >
                <span className="pdp__whoArrow" aria-hidden="true">
                  →
                </span>
                {item}
              </div>
            ))}
          </RevealOnScroll>
        </section>
      )}

      {/* ── Remaining Detail Sections ─────────────────────────────────── */}
      {detailSections.length > 1 && (
        <section className="pdp__detailSections">
          <div className="pdp__detailSectionsInner">
            {detailSections.slice(1).map((section, idx) => (
              <RevealOnScroll
                key={section.heading}
                className={`pdp__detailRow${idx % 2 === 1 ? " pdp__detailRow--alt" : ""}`}
              >
                <h3 className="pdp__detailRowTitle">{section.heading}</h3>
                <p className="pdp__detailRowBody">{section.description}</p>
              </RevealOnScroll>
            ))}
          </div>
        </section>
      )}

      {/* ── Expert ────────────────────────────────────────────────────── */}
      <section className="pdp__expertSection">
        <div className="pdp__expertInner container">
          <div className="pdp__expertLeft">
            {selectedProgram.expertGridImageUrl ? (
              <img
                src={optimizedExpertImage}
                srcSet={expertImageSrcSet}
                sizes="(max-width: 768px) 92vw, 420px"
                alt={selectedProgram.expertName}
                className="pdp__expertPhoto"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="pdp__expertPhotoFallback" aria-hidden="true">
                {selectedProgram.expertName.charAt(0)}
              </div>
            )}
            <RevealOnScroll
              className="pdp__expertOverlay"
              triggerBottomPercent={10}
            >
              <h3 className="pdp__expertName">{selectedProgram.expertName}</h3>
              <p className="pdp__expertTitle">{selectedProgram.expertTitle}</p>
            </RevealOnScroll>
          </div>

          <RevealOnScroll className="pdp__expertRight">
            <p>{selectedProgram.expertDetailedDescription}</p>
          </RevealOnScroll>
        </div>
      </section>
    </section>
  );
}
