interface VideoPlayerProps {
  streamUrl: string;
  title: string;
}

/**
 * YouTube iframe player for purchased library content.
 * Normalises watch URLs to embed URLs and renders in a responsive 16:9 frame.
 */
export default function VideoPlayer({ streamUrl, title }: VideoPlayerProps) {
  const embedUrl = toEmbedUrl(streamUrl);
  if (!embedUrl) return null;

  return (
    <div
      className="videoPlayer"
      style={{
        position: "relative",
        paddingBottom: "56.25%",
        height: 0,
        overflow: "hidden",
        borderRadius: "12px",
        background: "#000",
      }}
    >
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: 0,
        }}
      />
    </div>
  );
}

function toEmbedUrl(raw: string): string | null {
  if (!raw) return null;
  if (raw.includes("/embed/")) return raw;
  try {
    const url = new URL(raw);
    const videoId =
      url.searchParams.get("v") ??
      (url.hostname === "youtu.be" ? url.pathname.slice(1) : null);
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    // not a valid URL
  }
  return raw;
}
