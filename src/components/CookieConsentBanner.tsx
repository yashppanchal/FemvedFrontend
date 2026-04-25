import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCookieConsent } from "../consent/useCookieConsent";
import "./CookieConsentBanner.scss";

interface ToggleRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

function ToggleRow({ id, label, description, checked, disabled = false, onChange }: ToggleRowProps) {
  return (
    <label className={`cookieConsent__toggleRow${disabled ? " cookieConsent__toggleRow--disabled" : ""}`} htmlFor={id}>
      <div className="cookieConsent__toggleText">
        <span className="cookieConsent__toggleLabel">{label}</span>
        <span className="cookieConsent__toggleDescription">{description}</span>
      </div>
      <input
        id={id}
        className="cookieConsent__toggleInput"
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
      />
      <span className="cookieConsent__toggleVisual" aria-hidden="true" />
    </label>
  );
}

export function CookieConsentBanner() {
  const {
    isBannerVisible,
    isPreferencesOpen,
    preferences,
    acceptAll,
    rejectNonEssential,
    savePreferences,
    openPreferences,
    closePreferences,
  } = useCookieConsent();
  const [draft, setDraft] = useState({
    preferences: preferences.preferences,
    analytics: preferences.analytics,
    marketing: preferences.marketing,
  });

  useEffect(() => {
    setDraft({
      preferences: preferences.preferences,
      analytics: preferences.analytics,
      marketing: preferences.marketing,
    });
  }, [preferences]);

  const shouldShow = isBannerVisible || isPreferencesOpen;

  const preferenceText = useMemo(
    () =>
      isBannerVisible
        ? "We use necessary cookies and similar storage technologies to keep the site secure and working. You can choose whether to allow analytics, preferences, and marketing."
        : "You can update your consent choices any time.",
    [isBannerVisible],
  );

  if (!shouldShow) return null;

  return (
    <>
      {isPreferencesOpen && <button type="button" className="cookieConsent__backdrop" aria-label="Close cookie settings" onClick={closePreferences} />}

      <section
        className={`cookieConsent ${isPreferencesOpen ? "cookieConsent--modal" : "cookieConsent--banner"}`}
        role="dialog"
        aria-modal={isPreferencesOpen}
        aria-label="Cookie preferences"
      >
        <div className="cookieConsent__header">
          <h2 className="cookieConsent__title">Your privacy choices</h2>
          {isPreferencesOpen && (
            <button type="button" className="cookieConsent__close" onClick={closePreferences} aria-label="Close cookie settings">
              ×
            </button>
          )}
        </div>

        <p className="cookieConsent__copy">
          {preferenceText} See our <Link to="/privacy-policy">Privacy Policy</Link> for details.
        </p>

        {isPreferencesOpen && (
          <div className="cookieConsent__toggles">
            <ToggleRow
              id="consent-necessary"
              label="Strictly necessary"
              description="Required for login, security, and basic site functionality."
              checked
              disabled
            />
            <ToggleRow
              id="consent-preferences"
              label="Preferences"
              description="Remembers optional preferences to improve your experience."
              checked={draft.preferences}
              onChange={(checked) => setDraft((prev) => ({ ...prev, preferences: checked }))}
            />
            <ToggleRow
              id="consent-analytics"
              label="Analytics"
              description="Measures aggregate usage to improve pages and journeys."
              checked={draft.analytics}
              onChange={(checked) => setDraft((prev) => ({ ...prev, analytics: checked }))}
            />
            <ToggleRow
              id="consent-marketing"
              label="Marketing"
              description="Allows campaign and ad measurement technologies."
              checked={draft.marketing}
              onChange={(checked) => setDraft((prev) => ({ ...prev, marketing: checked }))}
            />
          </div>
        )}

        <div className="cookieConsent__actions">
          <button type="button" className="cookieConsent__btn cookieConsent__btn--ghost" onClick={rejectNonEssential}>
            Reject non-essential
          </button>
          <button type="button" className="cookieConsent__btn cookieConsent__btn--ghost" onClick={openPreferences}>
            Customize
          </button>
          {isPreferencesOpen && (
            <button
              type="button"
              className="cookieConsent__btn cookieConsent__btn--primary"
              onClick={() => savePreferences(draft)}
            >
              Save choices
            </button>
          )}
          <button type="button" className="cookieConsent__btn cookieConsent__btn--primary" onClick={acceptAll}>
            Accept all
          </button>
        </div>
      </section>
    </>
  );
}
