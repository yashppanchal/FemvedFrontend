import { type FormEvent, useEffect, useState } from "react";
import {
  adminLibrary,
  type AdminLibraryVideoListItem,
  type AdminLibraryCategoryDto,
  type CreateLibraryVideoRequest,
} from "../../../api/adminLibrary";
import { getAdminExperts, type AdminExpert } from "../../../api/admin";
import { ApiError } from "../../../api/client";
import LibraryVideoEditPanel from "./LibraryVideoEditPanel";

const VIDEO_TYPES = ["MASTERCLASS", "SERIES"] as const;

const CURRENCY_DEFAULTS: Record<string, { currencyCode: string; currencySymbol: string }> = {
  IN: { currencyCode: "INR", currencySymbol: "\u20B9" },
  GB: { currencyCode: "GBP", currencySymbol: "\u00A3" },
  US: { currencyCode: "USD", currencySymbol: "$" },
};

type CreateForm = {
  categoryId: string;
  expertId: string;
  title: string;
  slug: string;
  videoType: string;
  synopsis: string;
  trailerUrl: string;
  streamUrl: string;
  totalDuration: string;
  releaseYear: string;
  sortOrder: string;
  isFeatured: boolean;
  priceINR: string;
  priceGBP: string;
  priceUSD: string;
};
const emptyCreate: CreateForm = {
  categoryId: "",
  expertId: "",
  title: "",
  slug: "",
  videoType: "MASTERCLASS",
  synopsis: "",
  trailerUrl: "",
  streamUrl: "",
  totalDuration: "",
  releaseYear: "",
  sortOrder: "0",
  isFeatured: false,
  priceINR: "",
  priceGBP: "",
  priceUSD: "",
};

export default function LibraryVideosTab() {
  const [videos, setVideos] = useState<AdminLibraryVideoListItem[]>([]);
  const [categories, setCategories] = useState<AdminLibraryCategoryDto[]>([]);
  const [experts, setExperts] = useState<AdminExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateForm>(emptyCreate);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const [actionId, setActionId] = useState<string | null>(null);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      adminLibrary.getVideos(),
      adminLibrary.getCategories(),
      getAdminExperts(),
    ])
      .then(([v, c, e]) => {
        setVideos(v);
        setCategories(c);
        setExperts(e);
      })
      .catch((err) =>
        setLoadError(err instanceof ApiError ? err.message : "Failed to load."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    if (!form.categoryId || !form.expertId) {
      setFormError("Category and expert are required.");
      return;
    }
    setSaving(true);
    try {
      // Build direct prices from the form
      const prices: { locationCode: string; amount: number; currencyCode: string; currencySymbol: string; originalAmount?: number | null }[] = [];
      if (form.priceINR) prices.push({ locationCode: "IN", amount: Number(form.priceINR), ...CURRENCY_DEFAULTS.IN });
      if (form.priceGBP) prices.push({ locationCode: "GB", amount: Number(form.priceGBP), ...CURRENCY_DEFAULTS.GB });
      if (form.priceUSD) prices.push({ locationCode: "US", amount: Number(form.priceUSD), ...CURRENCY_DEFAULTS.US });

      const payload: CreateLibraryVideoRequest = {
        categoryId: form.categoryId,
        expertId: form.expertId,
        title: form.title.trim(),
        slug: form.slug.trim() || form.title.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        videoType: form.videoType,
        synopsis: form.synopsis.trim() || null,
        trailerUrl: form.trailerUrl.trim() || null,
        streamUrl: form.streamUrl.trim() || null,
        totalDuration: form.totalDuration.trim() || null,
        releaseYear: form.releaseYear.trim() || null,
        sortOrder: Number(form.sortOrder) || 0,
        isFeatured: form.isFeatured,
        prices: prices.length > 0 ? prices : undefined,
      };
      await adminLibrary.createVideo(payload);
      setFormSuccess("Video created (DRAFT). Click Edit to add episodes, testimonials, and more.");
      setForm(emptyCreate);
      setShowCreate(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Create failed.");
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (
    id: string,
    fn: (id: string) => Promise<void>,
    confirmMsg?: string,
  ) => {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setActionId(id);
    try {
      await fn(id);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setActionId(null);
    }
  };

  if (editingVideoId) {
    return (
      <LibraryVideoEditPanel
        videoId={editingVideoId}
        categories={categories}
        onClose={() => {
          setEditingVideoId(null);
          load();
        }}
      />
    );
  }

  return (
    <section className="adminPanel" role="tabpanel" aria-label="Library videos">
      <div className="adminPanel__header">
        <h2 className="adminPanel__title">Library Videos</h2>
        <p className="adminPanel__hint">Add and manage videos. Each video is a purchasable product.</p>
      </div>

      {loading && <p className="adminPanel__hint">Loading...</p>}
      {loadError && <p className="adminPanel__error">{loadError}</p>}
      {formSuccess && <p className="adminPanel__success">{formSuccess}</p>}
      {formError && <p className="adminPanel__error">{formError}</p>}

      <div className="adminPanel__toolbar">
        <button
          type="button"
          className="button"
          onClick={() => {
            setShowCreate((v) => !v);
            setForm(emptyCreate);
            setFormError(null);
            setFormSuccess(null);
          }}
        >
          {showCreate ? "Cancel" : "+ New Video"}
        </button>
        <span className="adminPanel__count">{videos.length} videos</span>
      </div>

      {showCreate && (
        <form className="form adminForm" onSubmit={onCreate} noValidate>
          <label className="field">
            <span className="field__label">Video Title</span>
            <input
              className="field__input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Understanding Your Hormonal Health"
              required
            />
          </label>
          <label className="field">
            <span className="field__label">URL Slug (auto-generated if empty)</span>
            <input
              className="field__input"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="e.g. understanding-hormonal-health"
            />
          </label>
          <label className="field">
            <span className="field__label">Video Type</span>
            <select
              className="field__input"
              value={form.videoType}
              onChange={(e) => setForm({ ...form, videoType: e.target.value })}
            >
              {VIDEO_TYPES.map((v) => (
                <option key={v} value={v}>{v === "MASTERCLASS" ? "Masterclass (single video)" : "Series (multiple episodes)"}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Category</span>
            <select
              className="field__input"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
            >
              <option value="">Select category...</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Expert</span>
            <select
              className="field__input"
              value={form.expertId}
              onChange={(e) => setForm({ ...form, expertId: e.target.value })}
              required
            >
              <option value="">Select expert...</option>
              {experts.map((e) => (
                <option key={e.expertId} value={e.expertId}>{e.displayName}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Short Description</span>
            <textarea
              className="field__input"
              rows={2}
              value={form.synopsis}
              onChange={(e) => setForm({ ...form, synopsis: e.target.value })}
              placeholder="Brief description shown on the video card"
            />
          </label>
          <label className="field">
            <span className="field__label">YouTube Trailer Link (free, visible to everyone)</span>
            <input
              className="field__input"
              value={form.trailerUrl}
              onChange={(e) => setForm({ ...form, trailerUrl: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
            />
          </label>
          {form.videoType === "MASTERCLASS" && (
            <label className="field">
              <span className="field__label">YouTube Video Link (paid, only after purchase)</span>
              <input
                className="field__input"
                value={form.streamUrl}
                onChange={(e) => setForm({ ...form, streamUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </label>
          )}

          <fieldset style={{ border: "1px solid rgba(15,15,16,0.1)", borderRadius: 8, padding: 16, margin: "8px 0" }}>
            <legend style={{ fontSize: 13, fontWeight: 600, padding: "0 8px" }}>Pricing (set price for each region)</legend>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <label className="field" style={{ flex: 1, minWidth: 120 }}>
                <span className="field__label">India (INR)</span>
                <input
                  className="field__input"
                  type="number"
                  step="1"
                  value={form.priceINR}
                  onChange={(e) => setForm({ ...form, priceINR: e.target.value })}
                  placeholder="e.g. 499"
                />
              </label>
              <label className="field" style={{ flex: 1, minWidth: 120 }}>
                <span className="field__label">UK (GBP)</span>
                <input
                  className="field__input"
                  type="number"
                  step="0.01"
                  value={form.priceGBP}
                  onChange={(e) => setForm({ ...form, priceGBP: e.target.value })}
                  placeholder="e.g. 9"
                />
              </label>
              <label className="field" style={{ flex: 1, minWidth: 120 }}>
                <span className="field__label">US (USD)</span>
                <input
                  className="field__input"
                  type="number"
                  step="0.01"
                  value={form.priceUSD}
                  onChange={(e) => setForm({ ...form, priceUSD: e.target.value })}
                  placeholder="e.g. 12"
                />
              </label>
            </div>
          </fieldset>

          <label className="field">
            <span className="field__label">Total Duration</span>
            <input
              className="field__input"
              value={form.totalDuration}
              onChange={(e) => setForm({ ...form, totalDuration: e.target.value })}
              placeholder="e.g. 45 min or 2h 15min"
            />
          </label>
          <label className="field">
            <span className="field__label">Release Year</span>
            <input
              className="field__input"
              value={form.releaseYear}
              onChange={(e) => setForm({ ...form, releaseYear: e.target.value })}
              placeholder="e.g. 2026"
            />
          </label>
          <label className="field">
            <span className="field__label">Display Order</span>
            <input
              className="field__input"
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            />
          </label>
          <label className="field" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
            />
            <span className="field__label" style={{ margin: 0 }}>Show as Featured (highlighted on homepage)</span>
          </label>
          <div className="adminForm__actions">
            <button type="submit" className="button" disabled={saving}>
              {saving ? "Creating..." : "Create Video"}
            </button>
          </div>
        </form>
      )}

      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Category</th>
              <th>Expert</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.length > 0 ? (
              videos.map((v) => (
                <tr key={v.videoId}>
                  <td>
                    {v.title}
                    {v.isFeatured && (
                      <span style={{ marginLeft: 8, fontSize: 10, color: "var(--primary, #56131b)" }}>
                        FEATURED
                      </span>
                    )}
                  </td>
                  <td>{v.videoType}</td>
                  <td>{v.categoryName}</td>
                  <td>{v.expertName}</td>
                  <td>
                    <span style={statusStyle(v.status)}>{v.status}</span>
                  </td>
                  <td>
                    <div className="adminActionGroup">
                      <button
                        className="adminActionButton"
                        onClick={() => setEditingVideoId(v.videoId)}
                      >
                        Edit
                      </button>
                      {v.status === "DRAFT" && (
                        <button
                          className="adminActionButton"
                          disabled={actionId === v.videoId}
                          onClick={() => runAction(v.videoId, adminLibrary.submitVideo)}
                        >
                          Submit
                        </button>
                      )}
                      {v.status === "PENDING_REVIEW" && (
                        <>
                          <button
                            className="adminActionButton"
                            disabled={actionId === v.videoId}
                            onClick={() => runAction(v.videoId, adminLibrary.publishVideo)}
                          >
                            Publish
                          </button>
                          <button
                            className="adminActionButton"
                            disabled={actionId === v.videoId}
                            onClick={() => runAction(v.videoId, adminLibrary.rejectVideo)}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {v.status === "PUBLISHED" && (
                        <button
                          className="adminActionButton"
                          disabled={actionId === v.videoId}
                          onClick={() =>
                            runAction(v.videoId, adminLibrary.archiveVideo, "Archive this video?")
                          }
                        >
                          Archive
                        </button>
                      )}
                      <button
                        className="adminActionButton adminActionButton--danger"
                        disabled={actionId === v.videoId}
                        onClick={() =>
                          runAction(v.videoId, adminLibrary.deleteVideo, "Delete this video?")
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="adminTable__empty">
                  No videos yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function statusStyle(status: string): React.CSSProperties {
  const base: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    padding: "3px 8px",
    borderRadius: 4,
  };
  switch (status) {
    case "PUBLISHED":
      return { ...base, background: "rgba(42, 122, 59, 0.12)", color: "#2a7a3b" };
    case "PENDING_REVIEW":
      return { ...base, background: "rgba(245, 166, 35, 0.12)", color: "#b37300" };
    case "ARCHIVED":
      return { ...base, background: "rgba(15, 15, 16, 0.08)", color: "rgba(15, 15, 16, 0.5)" };
    case "DRAFT":
    default:
      return { ...base, background: "rgba(86, 19, 27, 0.08)", color: "var(--primary, #56131b)" };
  }
}
