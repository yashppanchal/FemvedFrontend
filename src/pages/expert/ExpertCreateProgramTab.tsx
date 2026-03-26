import { type FormEvent, useEffect, useState } from "react";
import {
  createGuidedProgram,
  fetchGuidedTree,
} from "../../api/guided";
import { ApiError } from "../../api/client";
import { useAuth } from "../../auth/useAuth";
import { isValidUrl } from "../../validation";

interface FlatCategory {
  id: string;
  name: string;
  domainName: string;
}

interface DurationEntry {
  label: string;
  weeks: string;
  priceIN: string;
  priceUK: string;
  priceUS: string;
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

const initialDuration: DurationEntry = { label: "4 weeks", weeks: "4", priceIN: "", priceUK: "", priceUS: "" };

const emptyForm = {
  categoryId: "",
  name: "",
  slug: "",
  gridDescription: "",
  gridImageUrl: "",
  overview: "",
  tags: "",
  whatYouGet: "",
  whoIsThisFor: "",
};

export default function ExpertCreateProgramTab() {
  const { tokens } = useAuth();
  const [categories, setCategories] = useState<FlatCategory[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [durations, setDurations] = useState<DurationEntry[]>([{ ...initialDuration }]);
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

  const setDuration =
    (idx: number, key: keyof DurationEntry) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDurations((prev) =>
        prev.map((d, i) => (i === idx ? { ...d, [key]: e.target.value } : d)),
      );
    };

  const addDuration = () =>
    setDurations((prev) => [...prev, { ...initialDuration }]);

  const removeDuration = (idx: number) =>
    setDurations((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.categoryId || !form.name.trim() || !form.slug.trim()) {
      setError("Please fill in the health category, program title, and URL name.");
      return;
    }

    // URL validation for image fields
    if (form.gridImageUrl.trim() && !isValidUrl(form.gridImageUrl.trim())) {
      setError("Program Card Image URL is not a valid URL.");
      return;
    }

    const mappedDurations = [];
    for (let i = 0; i < durations.length; i++) {
      const d = durations[i];
      if (!d.label.trim()) {
        setError(`Duration ${i + 1}: please enter a label (e.g. "4 weeks").`);
        return;
      }
      if ((d.priceIN && Number(d.priceIN) < 0) || (d.priceUK && Number(d.priceUK) < 0) || (d.priceUS && Number(d.priceUS) < 0)) {
        setError("Prices cannot be negative.");
        return;
      }
      const prices = [];
      if (d.priceIN) prices.push({ locationCode: "IN", amount: Number(d.priceIN), currencyCode: "INR", currencySymbol: "₹" });
      if (d.priceUK) prices.push({ locationCode: "GB", amount: Number(d.priceUK), currencyCode: "GBP", currencySymbol: "£" });
      if (d.priceUS) prices.push({ locationCode: "US", amount: Number(d.priceUS), currencyCode: "USD", currencySymbol: "$" });
      if (prices.length === 0) {
        setError(`Duration ${i + 1} ("${d.label}"): please set a price for at least one region.`);
        return;
      }
      mappedDurations.push({
        label: d.label.trim(),
        weeks: parseInt(d.weeks, 10) || 4,
        sortOrder: i,
        prices,
      });
    }

    const accessToken = tokens?.accessToken;
    if (!accessToken) {
      setError("You must be logged in to create a program.");
      return;
    }

    setSubmitting(true);
    try {
      await createGuidedProgram({
        categoryId: form.categoryId,
        name: form.name.trim(),
        slug: form.slug.trim(),
        gridDescription: form.gridDescription.trim() || form.overview.trim(),
        gridImageUrl: form.gridImageUrl.trim(),
        overview: form.overview.trim(),
        sortOrder: 0,
        durations: mappedDurations,
        whatYouGet: form.whatYouGet.split("\n").map((s) => s.trim()).filter(Boolean),
        whoIsThisFor: form.whoIsThisFor.split("\n").map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        detailSections: [],
      }, accessToken);
      setSuccess("Your program has been created and submitted for review. The admin team will publish it once approved.");
      setForm(emptyForm);
      setDurations([{ ...initialDuration }]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="expertSection">
      <div className="expertSection__header">
        <div>
          <h2 className="expertSection__title">Create a New Program</h2>
          <p className="expertSection__lead">
            Fill in the details below to list your guided 1:1 program on FemVed.
            Once submitted, the admin team will review and publish it.
          </p>
        </div>
      </div>

      {success && <p className="expertSection__success">{success}</p>}
      {error && <p className="form__error">{error}</p>}
      {loading && <p className="expertSection__loading">Loading categories…</p>}

      {!loading && (
        <form className="form expertForm" onSubmit={handleSubmit} noValidate>

          {/* ── Section 1: Basic Info ─────────────────────────── */}
          <fieldset className="expertForm__section">
            <legend className="expertForm__sectionTitle">Basic Information</legend>

            <label className="field">
              <span className="field__label">Health Category <span className="field__required">*</span></span>
              <span className="field__hint">Choose which health area this program belongs to, e.g. Hormonal Health, Mindfulness.</span>
              <select
                className="field__input"
                value={form.categoryId}
                onChange={set("categoryId")}
                disabled={submitting}
              >
                <option value="">— Select a category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.domainName} / {c.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="expertForm__row">
              <label className="field">
                <span className="field__label">Program Title <span className="field__techTerm">(name)</span> <span className="field__required">*</span></span>
                <span className="field__hint">The full name of your program as clients will see it, e.g. "Break the Stress–Hormone Triangle".</span>
                <input
                  className="field__input"
                  type="text"
                  value={form.name}
                  onChange={handleNameChange}
                  disabled={submitting}
                  placeholder="e.g. Hormonal Balance Reset"
                />
              </label>
              <label className="field">
                <span className="field__label">Web Address Name <span className="field__techTerm">(slug)</span> <span className="field__required">*</span></span>
                <span className="field__hint">Auto-generated from the title. This appears in the browser URL — only edit if needed. Lowercase letters and hyphens only.</span>
                <input
                  className="field__input"
                  type="text"
                  value={form.slug}
                  onChange={set("slug")}
                  disabled={submitting}
                  placeholder="e.g. hormonal-balance-reset"
                />
              </label>
            </div>

            <label className="field">
              <span className="field__label">Program Card Image URL <span className="field__techTerm">(gridImageUrl)</span> <span className="field__optional">optional</span></span>
              <span className="field__hint">A Cloudinary image URL shown on the browse card for this program. Leave blank to use a placeholder.</span>
              <input
                className="field__input"
                type="url"
                value={form.gridImageUrl}
                onChange={set("gridImageUrl")}
                disabled={submitting}
                placeholder="https://res.cloudinary.com/..."
              />
            </label>
          </fieldset>

          {/* ── Section 2: Descriptions ───────────────────────── */}
          <fieldset className="expertForm__section">
            <legend className="expertForm__sectionTitle">Program Description</legend>

            <label className="field">
              <span className="field__label">Full Program Description <span className="field__techTerm">(overview)</span></span>
              <span className="field__hint">Describe your program in detail. This appears on the program's dedicated page. Explain what you offer, your approach, and what clients can expect.</span>
              <textarea
                className="field__input expertForm__textarea"
                value={form.overview}
                onChange={set("overview")}
                disabled={submitting}
                placeholder="e.g. This 6-week guided program is designed for women experiencing hormonal imbalances. Together we will..."
              />
            </label>

            <label className="field">
              <span className="field__label">Short Summary <span className="field__techTerm">(grid description)</span> <span className="field__optional">optional</span></span>
              <span className="field__hint">A 1–2 sentence teaser shown on browse and listing cards. If left blank, the first part of your full description will be used.</span>
              <textarea
                className="field__input expertForm__textarea expertForm__textarea--sm"
                value={form.gridDescription}
                onChange={set("gridDescription")}
                disabled={submitting}
                placeholder="e.g. A personalised 6-week plan to rebalance your hormones naturally through nutrition, lifestyle, and guided support."
              />
            </label>

            <label className="field">
              <span className="field__label">Search Tags <span className="field__techTerm">(tags)</span></span>
              <span className="field__hint">Keywords that help clients find your program when browsing. Separate each tag with a comma.</span>
              <span className="field__hintSub">e.g. hormones, PCOS, stress, gut-health, fertility</span>
              <input
                className="field__input"
                type="text"
                value={form.tags}
                onChange={set("tags")}
                disabled={submitting}
                placeholder="hormones, stress, PCOS, gut-health"
              />
            </label>
          </fieldset>

          {/* ── Section 3: What's included / Who it's for ──────── */}
          <fieldset className="expertForm__section">
            <legend className="expertForm__sectionTitle">Program Details</legend>

            <label className="field">
              <span className="field__label">What's Included in This Program <span className="field__techTerm">(what you get)</span></span>
              <span className="field__hint">List each benefit or deliverable on its own line. These appear as bullet points on your program page.</span>
              <textarea
                className="field__input expertForm__textarea"
                value={form.whatYouGet}
                onChange={set("whatYouGet")}
                disabled={submitting}
                placeholder={"Weekly 1:1 video consultation (60 min)\nPersonalised nutrition plan\nWhatsApp support between sessions\nProgress tracking & follow-up"}
              />
            </label>

            <label className="field">
              <span className="field__label">Who Is This Program For? <span className="field__techTerm">(who is this for)</span></span>
              <span className="field__hint">Describe the type of client this program is best suited for. One description per line — these appear as bullet points.</span>
              <textarea
                className="field__input expertForm__textarea expertForm__textarea--sm"
                value={form.whoIsThisFor}
                onChange={set("whoIsThisFor")}
                disabled={submitting}
                placeholder={"Women experiencing irregular or painful periods\nThose struggling with fatigue, mood swings, or weight changes\nAnyone wanting a natural approach to hormonal health"}
              />
            </label>
          </fieldset>

          {/* ── Section 4: Durations & Pricing ───────────────── */}
          <fieldset className="expertForm__section">
            <div className="expertForm__sectionHeader">
              <legend className="expertForm__sectionTitle">Durations &amp; Pricing</legend>
              <button
                type="button"
                className="adminActionButton adminActionButton--sm"
                onClick={addDuration}
                disabled={submitting}
              >
                + Add Duration
              </button>
            </div>
            <p className="expertForm__sectionHint">Add one or more duration options for your program. Each duration has its own pricing per region. At least one region price is required per duration.</p>

            {durations.map((dur, idx) => (
              <div key={idx} className="durationBlock">
                <div className="durationBlock__header">
                  <span className="durationBlock__label">Duration {idx + 1}</span>
                  {durations.length > 1 && (
                    <button
                      type="button"
                      className="adminActionButton adminActionButton--sm adminActionButton--danger"
                      onClick={() => removeDuration(idx)}
                      disabled={submitting}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="expertForm__row">
                  <label className="field">
                    <span className="field__label">Duration Label</span>
                    <span className="field__hint">Shown to clients, e.g. "4 weeks", "3 months".</span>
                    <input
                      className="field__input"
                      type="text"
                      value={dur.label}
                      onChange={setDuration(idx, "label")}
                      disabled={submitting}
                      placeholder="e.g. 4 weeks"
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Total Weeks</span>
                    <span className="field__hint">Used internally to calculate end dates.</span>
                    <input
                      className="field__input"
                      type="number"
                      min="1"
                      value={dur.weeks}
                      onChange={setDuration(idx, "weeks")}
                      disabled={submitting}
                    />
                  </label>
                </div>

                <div className="expertForm__row expertForm__row--3">
                  <label className="field">
                    <span className="field__label">India <span className="field__currency">₹ INR</span></span>
                    <input
                      className="field__input"
                      type="number"
                      min="0"
                      value={dur.priceIN}
                      onChange={setDuration(idx, "priceIN")}
                      placeholder="e.g. 33000"
                      disabled={submitting}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">United Kingdom <span className="field__currency">£ GBP</span></span>
                    <input
                      className="field__input"
                      type="number"
                      min="0"
                      value={dur.priceUK}
                      onChange={setDuration(idx, "priceUK")}
                      placeholder="e.g. 320"
                      disabled={submitting}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">United States <span className="field__currency">$ USD</span></span>
                    <input
                      className="field__input"
                      type="number"
                      min="0"
                      value={dur.priceUS}
                      onChange={setDuration(idx, "priceUS")}
                      placeholder="e.g. 400"
                      disabled={submitting}
                    />
                  </label>
                </div>
              </div>
            ))}
          </fieldset>

          <div className="expertForm__actions">
            <button type="submit" className="button expertForm__submit" disabled={submitting}>
              {submitting ? "Submitting for review…" : "Submit Program for Review"}
            </button>
          </div>

        </form>
      )}
    </section>
  );
}
