import "./LoadingScreen.scss";

interface LoadingScreenProps {
  message?: string;
  /** Use inside tabs, modals, and panels so the loader does not force full viewport height */
  compact?: boolean;
}

export function LoadingScreen({
  message = "Just a moment…",
  compact = false,
}: LoadingScreenProps) {
  const rootClass = ["loadingScreen", compact && "loadingScreen--compact"]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} aria-busy="true" aria-label={message} role="status">
      <div className="loadingScreen__scene">
        <div className="loadingScreen__halo loadingScreen__halo--1" />
        <div className="loadingScreen__halo loadingScreen__halo--2" />
        <div className="loadingScreen__halo loadingScreen__halo--3" />
        <div className="loadingScreen__moon">
          <div className="loadingScreen__shadow" />
        </div>
      </div>
      <p className="loadingScreen__label">{message}</p>
    </div>
  );
}
