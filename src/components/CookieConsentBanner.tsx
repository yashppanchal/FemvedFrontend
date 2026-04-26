import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useCookieConsent } from "../consent/useCookieConsent";
import { PrimaryButton } from "./PrimaryButton";
import { PrimaryOutlineButton } from "./PrimaryOutlineButton";
import "./CookieConsentBanner.scss";

export function CookieConsentBanner() {
  const { isBannerVisible, acceptAll, rejectNonEssential } = useCookieConsent();

  const preferenceText = useMemo(
    () => "We use cookies on our website to see how you interact with it.",
    [],
  );

  if (!isBannerVisible) return null;

  return (
    <section
      className="cookieConsent cookieConsent--banner"
      role="dialog"
      aria-modal={false}
      aria-label="Cookie notice"
    >
      <div className="cookieConsent__content">
        <p className="cookieConsent__copy">
          {preferenceText} By accepting, you agree to our use of such cookies.{" "}
          <Link to="/privacy-policy">Privacy Policy</Link>
        </p>

        <div className="cookieConsent__actions">
          <PrimaryOutlineButton
            label="Close"
            onClick={rejectNonEssential}
            aria-label="Close cookie notice"
          />
          <PrimaryButton
            label="Accept"
            className="cookieConsent__btn cookieConsent__btn--primary"
            onClick={acceptAll}
          />
        </div>
      </div>
    </section>
  );
}
