import { type FormEvent, useEffect, useState } from "react";
import {
  createGuidedProgram,
  fetchGuidedTree,
  type GuidedTreeCategory,
} from "../../api/guided";
import { ApiError } from "../../api/client";

interface FlatCategory {
  id: string;
  name: string;
  domainName: string;
}

function flattenCategories(tree: Awaited<ReturnType<typeof fetchGuidedTree>>): FlatCategory[] {
  const result: FlatCategory[] = [];
  for (const domain of tree.domains ?? []) {
    const domainName = domain.domainName ?? domain.name ?? "";
    for (const cat of domain.categories ?? []) {
      const catId = cat.categoryId ?? cat.id ?? cat._id ?? "";
      const catName = cat.categoryName ?? cat.name ?? "";
      if (catId) result.push({ id: catId, name: catName, domainName });
    }
  }
  return result;
}

const emptyForm = {
  categoryId: "",
  name: "",
  slug: "",
  gridDescription: "",
  overview: "",
  tags: "",
  whatYouGet: "",
  whoIsThisFor: "",
  durationLabel: "4 weeks",
  durationWeeks: "4",
  priceIN: "",
  priceUK: "",
  priceUS: "",
};

export default function ExpertCreateProgramTab() {
  const [categories, setCategories] = useState<FlatCategory[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchGuidedTree()
      .then((tree) => setCategories(flattenCategories(tree)))
      .catch(() => setError("Failed to load categories."))
      .finally(() => setLoading(false));
  }, []);

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setForm((prev) => ({ ...prev, name, slug }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.categoryId || !form.name.trim() || !form.slug.trim()) {
      setError("Category, name, and slug are required.");
      return;
    }

    const prices = [];
    if (form.priceIN) prices.push({ locationCode: "IN", amount: Number(form.priceIN), currencyCode: "INR", currencySymbol: "₹" });
    if (form.priceUK) prices.push({ locationCode: "UK", amount: Number(form.priceUK), currencyCode: "GBP", currencySymbol: "£" });
    if (form.priceUS) prices.push({ locationCode: "US", amount: Number(form.priceUS), currencyCode: "USD", currencySymbol: "$" });

    if (prices.length === 0) {
      setError("At least one price is required.");
      return;
    }

    setSubmitting(true);
    try {
      await createGuidedProgram({
        categoryId: form.categoryId,
        name: form.name.trim(),
        slug: form.slug.trim(),
        gridDescription: form.gridDescription.trim() || form.overview.trim(),
        gridImageUrl: "",
        overview: form.overview.trim(),
        sortOrder: 0,
        durations: [
          {
            label: form.durationLabel.trim(),
            weeks: parseInt(form.durationWeeks, 10) || 4,
            sortOrder: 0,
            prices,
          },
        ],
        whatYouGet: form.whatYouGet.split("\n").map((s) => s.trim()).filter(Boolean),
        whoIsThisFor: form.whoIsThisFor.split("\n").map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        detailSections: [],
      });
      setSuccess("Program created successfully.");
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create program.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="expertSection">
      <div className="expertSection__header">
        <h2 className="expertSection__title">Create Program</h2>
      </div>

      {success && <p className="expertSection__success">{success}</p>}
      {error && <p className="form__error">{error}</p>}
      {loading && <p className="expertSection__loading">Loading categories…</p>}

      {!loading && (
        <form className="form expertForm" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="field__label">Category *</span>
            <select
              className="field__input"
              value={form.categoryId}
              onChange={set("categoryId")}
              disabled={submitting}
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.domainName} / {c.name}
                </option>
              ))}
            </select>
          </label>

          <div className="expertForm__row">
            <label className="field">
              <span className="field__label">Program name *</span>
              <input
                className="field__input"
                type="text"
                value={form.name}
                onChange={handleNameChange}
                disabled={submitting}
              />
            </label>
            <label className="field">
              <span className="field__label">Slug *</span>
              <input
                className="field__input"
                type="text"
                value={form.slug}
                onChange={set("slug")}
                disabled={submitting}
              />
            </label>
          </div>

          <label className="field">
            <span className="field__label">Overview</span>
            <textarea
              className="field__input expertForm__textarea"
              value={form.overview}
              onChange={set("overview")}
              disabled={submitting}
            />
          </label>

          <label className="field">
            <span className="field__label">Grid description (short)</span>
            <textarea
              className="field__input expertForm__textarea expertForm__textarea--sm"
              value={form.gridDescription}
              onChange={set("gridDescription")}
              disabled={submitting}
              placeholder="Defaults to overview if empty"
            />
          </label>

          <label className="field">
            <span className="field__label">Tags (comma-separated)</span>
            <input
              className="field__input"
              type="text"
              value={form.tags}
              onChange={set("tags")}
              disabled={submitting}
            />
          </label>

          <label className="field">
            <span className="field__label">What you get (one per line)</span>
            <textarea
              className="field__input expertForm__textarea expertForm__textarea--sm"
              value={form.whatYouGet}
              onChange={set("whatYouGet")}
              disabled={submitting}
            />
          </label>

          <label className="field">
            <span className="field__label">Who is this for (one per line)</span>
            <textarea
              className="field__input expertForm__textarea expertForm__textarea--sm"
              value={form.whoIsThisFor}
              onChange={set("whoIsThisFor")}
              disabled={submitting}
            />
          </label>

          <div className="expertForm__row">
            <label className="field">
              <span className="field__label">Duration label</span>
              <input
                className="field__input"
                type="text"
                value={form.durationLabel}
                onChange={set("durationLabel")}
                disabled={submitting}
                placeholder="e.g. 4 weeks"
              />
            </label>
            <label className="field">
              <span className="field__label">Duration (weeks)</span>
              <input
                className="field__input"
                type="number"
                min="1"
                value={form.durationWeeks}
                onChange={set("durationWeeks")}
                disabled={submitting}
              />
            </label>
          </div>

          <fieldset className="expertForm__fieldset">
            <legend className="expertForm__legend">Prices</legend>
            <div className="expertForm__row expertForm__row--3">
              <label className="field">
                <span className="field__label">India (INR)</span>
                <input
                  className="field__input"
                  type="number"
                  min="0"
                  value={form.priceIN}
                  onChange={set("priceIN")}
                  placeholder="0"
                  disabled={submitting}
                />
              </label>
              <label className="field">
                <span className="field__label">UK (GBP)</span>
                <input
                  className="field__input"
                  type="number"
                  min="0"
                  value={form.priceUK}
                  onChange={set("priceUK")}
                  placeholder="0"
                  disabled={submitting}
                />
              </label>
              <label className="field">
                <span className="field__label">US (USD)</span>
                <input
                  className="field__input"
                  type="number"
                  min="0"
                  value={form.priceUS}
                  onChange={set("priceUS")}
                  placeholder="0"
                  disabled={submitting}
                />
              </label>
            </div>
          </fieldset>

          <div className="expertForm__actions">
            <button type="submit" className="button expertForm__submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create program"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
