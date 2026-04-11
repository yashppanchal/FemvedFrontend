import { type FormEvent, useEffect, useState } from "react";
import {
  adminLibrary,
  type AdminLibraryVideoDetail,
  type AdminLibraryCategoryDto,
  type UpdateLibraryVideoRequest,
  type AddLibraryEpisodeRequest,
  type AddLibraryTestimonialRequest,
  type AddLibraryVideoPriceRequest,
} from "../../../api/adminLibrary";
import { ApiError } from "../../../api/client";
import { LoadingScreen } from "../../../components/LoadingScreen";

const LOCATIONS = ["IN", "GB", "US"] as const;
const CURRENCY_DEFAULTS: Record<string, { code: string; symbol: string }> = {
  IN: { code: "INR", symbol: "\u20B9" },
  GB: { code: "GBP", symbol: "\u00A3" },
  US: { code: "USD", symbol: "$" },
};

interface Props {
  videoId: string;
  categories: AdminLibraryCategoryDto[];
  onClose: () => void;
}

export default function LibraryVideoEditPanel({
  videoId,
  categories,
  onClose,
}: Props) {
  const [video, setVideo] = useState<AdminLibraryVideoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // Editable fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [description, setDescription] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [totalDuration, setTotalDuration] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [cardImage, setCardImage] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [iconEmoji, setIconEmoji] = useState("");
  const [gradientClass, setGradientClass] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState("0");
  const [tagsStr, setTagsStr] = useState("");
  const [featuresStr, setFeaturesStr] = useState("");

  // Episode add/edit form
  const [epTitle, setEpTitle] = useState("");
  const [epNumber, setEpNumber] = useState("");
  const [epStreamUrl, setEpStreamUrl] = useState("");
  const [epDuration, setEpDuration] = useState("");
  const [epFreePreview, setEpFreePreview] = useState(false);
  const [editingEpId, setEditingEpId] = useState<string | null>(null);

  // Testimonial add form
  const [tName, setTName] = useState("");
  const [tText, setTText] = useState("");
  const [tRating, setTRating] = useState("5");

  // Price add form
  const [prLocation, setPrLocation] = useState("GB");
  const [prAmount, setPrAmount] = useState("");
  const [prOriginal, setPrOriginal] = useState("");

  const load = () => {
    setLoading(true);
    adminLibrary
      .getVideoDetail(videoId)
      .then((v) => {
        setVideo(v);
        setTitle(v.title);
        setSlug(v.slug);
        setSynopsis(v.synopsis ?? "");
        setDescription(v.description ?? "");
        setTrailerUrl(v.trailerUrl ?? "");
        setStreamUrl(v.streamUrl ?? "");
        setTotalDuration(v.totalDuration ?? "");
        setReleaseYear(v.releaseYear ?? "");
        setCategoryId(v.categoryId);
        setCardImage(v.cardImage ?? "");
        setHeroImage(v.heroImage ?? "");
        setIconEmoji(v.iconEmoji ?? "");
        setGradientClass(v.gradientClass ?? "");
        setIsFeatured(v.isFeatured);
        setSortOrder(String(v.sortOrder));
        setTagsStr(v.tags.map((t) => t.tag).join(", "));
        setFeaturesStr(
          v.features.map((f) => `${f.icon}|${f.description}`).join("\n"),
        );
      })
      .catch((err) =>
        setLoadError(err instanceof ApiError ? err.message : "Failed to load video."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [videoId]);

  const flash = (m: string) => {
    setMsg(m);
    setErrMsg(null);
  };
  const flashErr = (err: unknown) => {
    setErrMsg(err instanceof ApiError ? err.message : "Action failed.");
    setMsg(null);
  };

  // ── Save main fields ──────────────────────────────────────────────────────
  const onSaveMain = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setErrMsg(null);
    try {
      const tags = tagsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const features = featuresStr
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const [icon, ...rest] = line.split("|");
          return { icon: icon?.trim() ?? "\u2713", description: rest.join("|").trim() };
        });
      const payload: UpdateLibraryVideoRequest = {
        categoryId,
        title: title.trim(),
        slug: slug.trim(),
        synopsis: synopsis.trim() || null,
        description: description.trim() || null,
        trailerUrl: trailerUrl.trim() || null,
        streamUrl: streamUrl.trim() || null,
        totalDuration: totalDuration.trim() || null,
        releaseYear: releaseYear.trim() || null,
        cardImage: cardImage.trim() || null,
        heroImage: heroImage.trim() || null,
        iconEmoji: iconEmoji.trim() || null,
        gradientClass: gradientClass.trim() || null,
        isFeatured,
        sortOrder: Number(sortOrder) || 0,
        tags,
        features,
      };
      await adminLibrary.updateVideo(videoId, payload);
      flash("Video saved.");
      load();
    } catch (err) {
      flashErr(err);
    } finally {
      setSaving(false);
    }
  };

  // ── Episodes ──────────────────────────────────────────────────────────────
  const clearEpForm = () => {
    setEpTitle("");
    setEpNumber("");
    setEpStreamUrl("");
    setEpDuration("");
    setEpFreePreview(false);
    setEditingEpId(null);
  };

  const startEditEpisode = (ep: AdminLibraryVideoDetail["episodes"][number]) => {
    setEditingEpId(ep.episodeId);
    setEpNumber(String(ep.episodeNumber));
    setEpTitle(ep.title);
    setEpStreamUrl(ep.streamUrl ?? "");
    setEpDuration(ep.duration ?? "");
    setEpFreePreview(ep.isFreePreview);
    setTimeout(() => {
      document.getElementById("episode-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const saveOrAddEpisode = async () => {
    if (!epTitle.trim()) return;
    try {
      if (editingEpId) {
        await adminLibrary.updateEpisode(editingEpId, {
          episodeNumber: Number(epNumber) || undefined,
          title: epTitle.trim(),
          streamUrl: epStreamUrl.trim() || null,
          duration: epDuration.trim() || null,
          isFreePreview: epFreePreview,
        });
        flash("Episode updated.");
      } else {
        const r: AddLibraryEpisodeRequest = {
          episodeNumber: Number(epNumber) || (video?.episodes.length ?? 0) + 1,
          title: epTitle.trim(),
          streamUrl: epStreamUrl.trim() || null,
          duration: epDuration.trim() || null,
          isFreePreview: epFreePreview,
        };
        await adminLibrary.addEpisode(videoId, r);
        flash("Episode added.");
      }
      clearEpForm();
      load();
    } catch (err) {
      flashErr(err);
    }
  };

  const deleteEpisode = async (epId: string) => {
    if (!confirm("Delete episode?")) return;
    try {
      await adminLibrary.deleteEpisode(epId);
      if (editingEpId === epId) clearEpForm();
      flash("Episode deleted.");
      load();
    } catch (err) {
      flashErr(err);
    }
  };

  // ── Testimonials ──────────────────────────────────────────────────────────
  const addTestimonial = async () => {
    if (!tName.trim() || !tText.trim()) return;
    try {
      const r: AddLibraryTestimonialRequest = {
        reviewerName: tName.trim(),
        reviewText: tText.trim(),
        rating: Number(tRating) || 5,
      };
      await adminLibrary.addTestimonial(videoId, r);
      setTName("");
      setTText("");
      setTRating("5");
      flash("Testimonial added.");
      load();
    } catch (err) {
      flashErr(err);
    }
  };

  const deleteTestimonial = async (tId: string) => {
    if (!confirm("Delete testimonial?")) return;
    try {
      await adminLibrary.deleteTestimonial(tId);
      flash("Testimonial deleted.");
      load();
    } catch (err) {
      flashErr(err);
    }
  };

  // ── Pricing ───────────────────────────────────────────────────────────────
  const addPrice = async () => {
    if (!prAmount) return;
    try {
      const cur = CURRENCY_DEFAULTS[prLocation];
      const r: AddLibraryVideoPriceRequest = {
        locationCode: prLocation,
        amount: Number(prAmount),
        currencyCode: cur.code,
        currencySymbol: cur.symbol,
        originalAmount: prOriginal ? Number(prOriginal) : null,
      };
      await adminLibrary.addVideoPrice(videoId, r);
      setPrAmount("");
      setPrOriginal("");
      flash("Price added.");
      load();
    } catch (err) {
      flashErr(err);
    }
  };

  const deletePrice = async (priceId: string) => {
    if (!confirm("Remove this price?")) return;
    try {
      await adminLibrary.deleteVideoPrice(priceId);
      flash("Price removed.");
      load();
    } catch (err) {
      flashErr(err);
    }
  };

  if (loading) {
    return (
      <section className="adminPanel">
        <LoadingScreen compact message="Loading video details…" />
      </section>
    );
  }

  if (loadError || !video) {
    return (
      <section className="adminPanel">
        <p className="adminPanel__error">{loadError ?? "Video not found."}</p>
        <button type="button" className="adminActionButton" onClick={onClose}>
          &larr; Back
        </button>
      </section>
    );
  }

  return (
    <section className="adminPanel" role="tabpanel" aria-label="Edit video">
      <div className="adminPanel__header">
        <h2 className="adminPanel__title">Edit: {video.title}</h2>
        <button type="button" className="adminActionButton" onClick={onClose}>
          &larr; Back to list
        </button>
      </div>

      <p className="adminPanel__hint">
        Status: <strong>{video.status}</strong> &middot; Type: <strong>{video.videoType}</strong>
      </p>

      {msg && <p className="adminPanel__success">{msg}</p>}
      {errMsg && <p className="adminPanel__error">{errMsg}</p>}

      {/* ── Main fields ──────────────────────────────────────────────────── */}
      <form className="form adminForm" onSubmit={onSaveMain} noValidate>
        <label className="field">
          <span className="field__label">Video Title</span>
          <input className="field__input" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label className="field">
          <span className="field__label">URL Slug</span>
          <input className="field__input" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </label>
        <label className="field">
          <span className="field__label">Category</span>
          <select className="field__input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field__label">Short Description</span>
          <textarea className="field__input" rows={2} value={synopsis} onChange={(e) => setSynopsis(e.target.value)} placeholder="Brief description shown on the video card" />
        </label>
        <label className="field">
          <span className="field__label">Full Description (HTML)</span>
          <textarea className="field__input" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed description shown on the video detail page" />
        </label>
        <label className="field">
          <span className="field__label">YouTube Trailer Link (free, visible to everyone)</span>
          <input className="field__input" value={trailerUrl} onChange={(e) => setTrailerUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
        </label>
        {video.videoType === "MASTERCLASS" && (
          <label className="field">
            <span className="field__label">YouTube Video Link (paid, only after purchase)</span>
            <input className="field__input" value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
          </label>
        )}
        <label className="field">
          <span className="field__label">Total Duration</span>
          <input className="field__input" value={totalDuration} onChange={(e) => setTotalDuration(e.target.value)} placeholder="e.g. 45 min" />
        </label>
        <label className="field">
          <span className="field__label">Release Year</span>
          <input className="field__input" value={releaseYear} onChange={(e) => setReleaseYear(e.target.value)} placeholder="e.g. 2026" />
        </label>
        <label className="field">
          <span className="field__label">Card Image URL (thumbnail)</span>
          <input className="field__input" value={cardImage} onChange={(e) => setCardImage(e.target.value)} placeholder="https://..." />
        </label>
        <label className="field">
          <span className="field__label">Hero Image URL (detail page banner)</span>
          <input className="field__input" value={heroImage} onChange={(e) => setHeroImage(e.target.value)} placeholder="https://..." />
        </label>
        <label className="field">
          <span className="field__label">Icon Emoji (fallback if no image)</span>
          <input className="field__input" value={iconEmoji} onChange={(e) => setIconEmoji(e.target.value)} placeholder="e.g. \uD83E\uDDD8" />
        </label>
        <label className="field">
          <span className="field__label">Gradient Style (fallback background)</span>
          <input className="field__input" value={gradientClass} onChange={(e) => setGradientClass(e.target.value)} placeholder="grad-1, grad-2, or grad-3" />
        </label>
        <label className="field">
          <span className="field__label">Display Order</span>
          <input className="field__input" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
        </label>
        <label className="field" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
          <span className="field__label" style={{ margin: 0 }}>Show as Featured</span>
        </label>
        <label className="field">
          <span className="field__label">Tags (comma-separated)</span>
          <input className="field__input" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="stress, hormones, sleep" />
        </label>
        <label className="field">
          <span className="field__label">Features (one per line: icon|description)</span>
          <textarea className="field__input" rows={3} value={featuresStr} onChange={(e) => setFeaturesStr(e.target.value)} placeholder={"\u2713|Lifetime access\n\uD83D\uDCF1|Watch on any device"} />
        </label>
        <div className="adminForm__actions">
          <button type="submit" className="button" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <div className="adminPanel__header" style={{ marginTop: 24 }}>
        <h3 className="adminPanel__title">Pricing ({video.priceOverrides.length})</h3>
        <p className="adminPanel__hint">Set a price for each region. Users see the price for their country.</p>
      </div>

      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th>Region</th>
              <th>Price</th>
              <th>Original (strikethrough)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {video.priceOverrides.map((p) => (
              <tr key={p.priceId}>
                <td>{p.locationCode}</td>
                <td>{p.currencySymbol}{p.amount}</td>
                <td>{p.originalAmount != null ? `${p.currencySymbol}${p.originalAmount}` : "\u2014"}</td>
                <td>
                  <button
                    className="adminActionButton adminActionButton--danger"
                    onClick={() => deletePrice(p.priceId)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="form adminForm" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        <label className="field" style={{ flex: "0 0 80px" }}>
          <span className="field__label">Region</span>
          <select className="field__input" value={prLocation} onChange={(e) => setPrLocation(e.target.value)}>
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </label>
        <label className="field" style={{ flex: "0 0 120px" }}>
          <span className="field__label">Price</span>
          <input className="field__input" type="number" step="0.01" value={prAmount} onChange={(e) => setPrAmount(e.target.value)} />
        </label>
        <label className="field" style={{ flex: "0 0 120px" }}>
          <span className="field__label">Original (optional)</span>
          <input className="field__input" type="number" step="0.01" value={prOriginal} onChange={(e) => setPrOriginal(e.target.value)} />
        </label>
        <button type="button" className="button" onClick={addPrice}>
          + Add Price
        </button>
      </div>

      {/* ── Episodes ─────────────────────────────────────────────────────── */}
      {video.videoType === "SERIES" && (
        <>
          <div className="adminPanel__header" style={{ marginTop: 24 }}>
            <h3 className="adminPanel__title">Episodes ({video.episodes.length})</h3>
            <p className="adminPanel__hint">Each episode has its own YouTube link. Mark episode 1 as free for preview.</p>
          </div>

          <div className="adminTableWrap">
            <table className="adminTable">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Episode Title</th>
                  <th>Duration</th>
                  <th>Free Preview?</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {video.episodes.map((ep) => (
                  <tr key={ep.episodeId}>
                    <td>{ep.episodeNumber}</td>
                    <td>{ep.title}</td>
                    <td>{ep.duration ?? "\u2014"}</td>
                    <td>{ep.isFreePreview ? "Yes" : "No"}</td>
                    <td>
                      <div className="adminActionGroup">
                        <button
                          className="adminActionButton"
                          onClick={() => startEditEpisode(ep)}
                        >
                          Edit
                        </button>
                        <button
                          className="adminActionButton adminActionButton--danger"
                          onClick={() => deleteEpisode(ep.episodeId)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {editingEpId && (
            <p style={{ margin: "8px 0", fontSize: 13, fontWeight: 600, color: "var(--primary, #56131b)" }}>
              Editing episode — update fields below and click Save Episode
            </p>
          )}
          <div id="episode-form" className="form adminForm" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", border: editingEpId ? "2px solid var(--primary, #56131b)" : undefined, borderRadius: editingEpId ? 8 : undefined, padding: editingEpId ? 12 : undefined }}>
            <label className="field" style={{ flex: "0 0 60px" }}>
              <span className="field__label">#</span>
              <input className="field__input" type="number" value={epNumber} onChange={(e) => setEpNumber(e.target.value)} placeholder="auto" />
            </label>
            <label className="field" style={{ flex: 1, minWidth: 160 }}>
              <span className="field__label">Episode Title</span>
              <input className="field__input" value={epTitle} onChange={(e) => setEpTitle(e.target.value)} />
            </label>
            <label className="field" style={{ flex: "0 0 200px" }}>
              <span className="field__label">YouTube Link (paid)</span>
              <input className="field__input" value={epStreamUrl} onChange={(e) => setEpStreamUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
            </label>
            <label className="field" style={{ flex: "0 0 100px" }}>
              <span className="field__label">Duration</span>
              <input className="field__input" value={epDuration} onChange={(e) => setEpDuration(e.target.value)} placeholder="12 min" />
            </label>
            <label className="field" style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <input type="checkbox" checked={epFreePreview} onChange={(e) => setEpFreePreview(e.target.checked)} />
              <span className="field__label" style={{ margin: 0 }}>Free</span>
            </label>
            <button type="button" className="button" onClick={saveOrAddEpisode}>
              {editingEpId ? "Save Episode" : "+ Episode"}
            </button>
            {editingEpId && (
              <button type="button" className="adminActionButton" onClick={clearEpForm}>
                Cancel
              </button>
            )}
          </div>
        </>
      )}

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <div className="adminPanel__header" style={{ marginTop: 24 }}>
        <h3 className="adminPanel__title">Testimonials ({video.testimonials.length})</h3>
      </div>

      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Review</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {video.testimonials.map((t) => (
              <tr key={t.testimonialId}>
                <td>{t.reviewerName}</td>
                <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.reviewText}</td>
                <td>{"\u2605".repeat(t.rating)}</td>
                <td>
                  <button
                    className="adminActionButton adminActionButton--danger"
                    onClick={() => deleteTestimonial(t.testimonialId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="form adminForm" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        <label className="field" style={{ flex: 1, minWidth: 120 }}>
          <span className="field__label">Reviewer Name</span>
          <input className="field__input" value={tName} onChange={(e) => setTName(e.target.value)} />
        </label>
        <label className="field" style={{ flex: 2, minWidth: 200 }}>
          <span className="field__label">Review Text</span>
          <input className="field__input" value={tText} onChange={(e) => setTText(e.target.value)} />
        </label>
        <label className="field" style={{ flex: "0 0 60px" }}>
          <span className="field__label">Rating</span>
          <input className="field__input" type="number" min="1" max="5" value={tRating} onChange={(e) => setTRating(e.target.value)} />
        </label>
        <button type="button" className="button" onClick={addTestimonial}>
          + Testimonial
        </button>
      </div>
    </section>
  );
}
