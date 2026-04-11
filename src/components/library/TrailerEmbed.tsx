import "./TrailerEmbed.scss";

interface TrailerEmbedProps {
  trailerUrl: string;
  title: string;
  /** Increment to reload the iframe with autoplay (e.g. after a user gesture elsewhere on the page). */
  playNonce?: number;
}

/**
 * Renders a YouTube trailer in a responsive 16:9 iframe.
 * Accepts full YouTube watch URLs or embed URLs and normalises them.
 */
export default function TrailerEmbed({
  trailerUrl,
  title,
  playNonce = 0,
}: TrailerEmbedProps) {
  const embedUrl = toEmbedUrl(trailerUrl);
  if (!embedUrl) return null;

  const src = playNonce > 0 ? withAutoplay(embedUrl) : embedUrl;

  return (
    <div className="trailerEmbed">
      <iframe
        key={playNonce}
        src={src}
        title={`${title} — Trailer`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function withAutoplay(embedUrl: string): string {
  try {
    const u = new URL(embedUrl);
    u.searchParams.set("autoplay", "1");
    return u.toString();
  } catch {
    return embedUrl.includes("?")
      ? `${embedUrl}&autoplay=1`
      : `${embedUrl}?autoplay=1`;
  }
}

/** Converts a YouTube watch URL or short link to an embed URL. */
function toEmbedUrl(raw: string): string | null {
  if (!raw) return null;

  // Already an embed URL
  if (raw.includes("/embed/")) return raw;

  // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
  try {
    const url = new URL(raw);
    const videoId =
      url.searchParams.get("v") ??
      // youtu.be/VIDEO_ID short link
      (url.hostname === "youtu.be" ? url.pathname.slice(1) : null);
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    // not a valid URL
  }

  return raw;
}
