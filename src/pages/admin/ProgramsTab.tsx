import { useMemo, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import type { CategoryRow, DomainRow, ProgramForm, ProgramRow } from "./types";

type ProgramsTabProps = {
  programCreateSuccess: string | null;
  programCreateError: string | null;
  onOpenAddModal: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  programForm: ProgramForm;
  onProgramFormChange: (updater: (prev: ProgramForm) => ProgramForm) => void;
  domains: DomainRow[];
  categoriesForProgramDomain: CategoryRow[];
  isProgramModalOpen: boolean;
  onCloseModal: () => void;
  isCreatingProgram: boolean;
  editingProgramId: string | null;
  programs: ProgramRow[];
  categories: CategoryRow[];
  onStartEdit: (program: ProgramRow) => void;
  onDelete: (programId: string) => void;
  deletingProgramId: string | null;
};

export function ProgramsTab({
  programCreateSuccess,
  programCreateError,
  onOpenAddModal,
  onSubmit,
  programForm,
  onProgramFormChange,
  domains,
  categoriesForProgramDomain,
  isProgramModalOpen,
  onCloseModal,
  isCreatingProgram,
  editingProgramId,
  programs,
  categories,
  onStartEdit,
  onDelete,
  deletingProgramId,
}: ProgramsTabProps) {
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const set = (key: keyof ProgramForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      onProgramFormChange((prev) => ({ ...prev, [key]: e.target.value }));

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    onProgramFormChange((prev) => ({ ...prev, name, slug: slug as never }));
  };

  const categoriesForFilter = useMemo(() => {
    if (domainFilter === "all") return categories;
    return categories.filter((category) => category.domainId === domainFilter);
  }, [categories, domainFilter]);

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      const matchesDomain = domainFilter === "all" || program.domainId === domainFilter;
      const matchesCategory = categoryFilter === "all" || program.categoryId === categoryFilter;
      return matchesDomain && matchesCategory;
    });
  }, [programs, domainFilter, categoryFilter]);

  const programModal = isProgramModalOpen ? (
    <div className="adminModalBackdrop" role="presentation">
      <section
        className="adminModal adminModal--wide"
        role="dialog"
        aria-modal="true"
        aria-label={editingProgramId ? "Edit program" : "Create program"}
      >
        <div className="adminModal__header">
          <h3 className="adminModal__title">
            {editingProgramId ? "Edit Program" : "Add New Program"}
          </h3>
          <button
            type="button"
            className="adminActionButton"
            onClick={onCloseModal}
            disabled={isCreatingProgram}
          >
            Close
          </button>
        </div>

        {programCreateError && <p className="adminPanel__error">{programCreateError}</p>}

        <form className="form adminForm" onSubmit={onSubmit} noValidate>

          {/* ── Section 1: Placement ──────────────────────────────── */}
          <div className="expertForm__section">
            <h4 className="expertForm__sectionTitle">Where does this program live?</h4>

            <div className="adminForm__row adminForm__row--two">
              <label className="field">
                <span className="field__label">Domain <span className="field__required">*</span></span>
                <span className="field__hint">The top-level health domain, e.g. "Guided 1:1 Care".</span>
                <select
                  className="field__input"
                  value={programForm.domainId}
                  onChange={(e) =>
                    onProgramFormChange((prev) => ({ ...prev, domainId: e.target.value, categoryId: "" }))
                  }
                  required
                >
                  <option value="">— Select domain —</option>
                  {domains.map((domain) => (
                    <option key={domain.id} value={domain.id}>{domain.name}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="field__label">Health Category <span className="field__required">*</span></span>
                <span className="field__hint">The specific area this program belongs to, e.g. Hormonal Health.</span>
                <select
                  className="field__input"
                  value={programForm.categoryId}
                  onChange={(e) => onProgramFormChange((prev) => ({ ...prev, categoryId: e.target.value }))}
                  required
                  disabled={!programForm.domainId}
                >
                  <option value="">{programForm.domainId ? "— Select category —" : "Select domain first"}</option>
                  {categoriesForProgramDomain.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* ── Section 2: Basic Info ─────────────────────────────── */}
          <div className="expertForm__section">
            <h4 className="expertForm__sectionTitle">Basic Information</h4>

            <label className="field">
              <span className="field__label">Program Title <span className="field__required">*</span></span>
              <span className="field__hint">The full name as clients will see it, e.g. "Break the Stress–Hormone Triangle".</span>
              <input
                className="field__input"
                type="text"
                value={programForm.name}
                onChange={handleNameChange}
                placeholder="e.g. Hormonal Balance Reset"
                required
                disabled={isCreatingProgram}
              />
            </label>

            <div className="adminForm__row adminForm__row--two">
              <label className="field">
                <span className="field__label">Program Card Image URL <span className="field__optional">optional</span></span>
                <span className="field__hint">Shown on browse cards. Leave blank for a placeholder.</span>
                <input
                  className="field__input"
                  type="url"
                  value={programForm.gridImageUrl}
                  onChange={set("gridImageUrl")}
                  placeholder="https://res.cloudinary.com/..."
                  disabled={isCreatingProgram}
                />
              </label>

              <label className="field">
                <span className="field__label">Display Order <span className="field__techTerm">(sort order)</span> <span className="field__optional">optional</span></span>
                <span className="field__hint">Lower numbers appear first. 0 = default.</span>
                <input
                  className="field__input"
                  type="number"
                  min={0}
                  value={programForm.sortOrder}
                  onChange={set("sortOrder")}
                  disabled={isCreatingProgram}
                />
              </label>
            </div>
          </div>

          {/* ── Section 3: Descriptions ───────────────────────────── */}
          <div className="expertForm__section">
            <h4 className="expertForm__sectionTitle">Program Description</h4>

            <label className="field">
              <span className="field__label">Full Program Description <span className="field__techTerm">(overview)</span></span>
              <span className="field__hint">Appears on the program's dedicated page. Explain the approach and what clients can expect.</span>
              <textarea
                className="field__input expertForm__textarea"
                value={programForm.overview}
                onChange={set("overview")}
                rows={4}
                placeholder="e.g. This 6-week guided program is designed for women experiencing hormonal imbalances..."
                disabled={isCreatingProgram}
              />
            </label>

            <label className="field">
              <span className="field__label">Short Summary <span className="field__techTerm">(grid description)</span> <span className="field__optional">optional</span></span>
              <span className="field__hint">1–2 sentence teaser shown on browse cards. Defaults to overview if blank.</span>
              <textarea
                className="field__input expertForm__textarea expertForm__textarea--sm"
                value={programForm.gridDescription}
                onChange={set("gridDescription")}
                rows={2}
                placeholder="e.g. A personalised 6-week plan to rebalance hormones naturally."
                disabled={isCreatingProgram}
              />
            </label>

            <label className="field">
              <span className="field__label">Search Tags <span className="field__optional">optional</span></span>
              <span className="field__hint">Comma-separated keywords. e.g. hormones, PCOS, stress, gut-health</span>
              <input
                className="field__input"
                type="text"
                value={programForm.tags}
                onChange={set("tags")}
                placeholder="hormones, stress, PCOS, gut-health"
                disabled={isCreatingProgram}
              />
            </label>
          </div>

          {/* ── Section 4: Details ────────────────────────────────── */}
          <div className="expertForm__section">
            <h4 className="expertForm__sectionTitle">Program Details</h4>

            <label className="field">
              <span className="field__label">What's Included <span className="field__techTerm">(what you get)</span></span>
              <span className="field__hint">One bullet point per line. Shown on the program page.</span>
              <textarea
                className="field__input expertForm__textarea"
                value={programForm.whatYouGet}
                onChange={set("whatYouGet")}
                rows={4}
                placeholder={"Weekly 1:1 video consultation (60 min)\nPersonalised nutrition plan\nWhatsApp support between sessions"}
                disabled={isCreatingProgram}
              />
            </label>

            <label className="field">
              <span className="field__label">Who Is This For? <span className="field__techTerm">(who is this for)</span></span>
              <span className="field__hint">One description per line. Helps clients self-identify.</span>
              <textarea
                className="field__input expertForm__textarea expertForm__textarea--sm"
                value={programForm.whoIsThisFor}
                onChange={set("whoIsThisFor")}
                rows={3}
                placeholder={"Women experiencing irregular or painful periods\nThose struggling with fatigue or mood swings"}
                disabled={isCreatingProgram}
              />
            </label>
          </div>

          {/* ── Section 5: Duration ───────────────────────────────── */}
          <div className="expertForm__section">
            <h4 className="expertForm__sectionTitle">Duration</h4>

            <div className="adminForm__row adminForm__row--two">
              <label className="field">
                <span className="field__label">Duration Label <span className="field__required">*</span></span>
                <span className="field__hint">How the length is shown to clients, e.g. "6 weeks".</span>
                <input
                  className="field__input"
                  type="text"
                  value={programForm.durationLabel}
                  onChange={set("durationLabel")}
                  placeholder="e.g. 4 weeks, 3 months"
                  required
                  disabled={isCreatingProgram}
                />
              </label>

              <label className="field">
                <span className="field__label">Total Weeks</span>
                <span className="field__hint">Used internally for scheduling.</span>
                <input
                  className="field__input"
                  type="number"
                  min={1}
                  value={programForm.durationWeeks}
                  onChange={set("durationWeeks")}
                  disabled={isCreatingProgram}
                />
              </label>
            </div>
          </div>

          {/* ── Section 6: Pricing ────────────────────────────────── */}
          <div className="expertForm__section">
            <h4 className="expertForm__sectionTitle">Pricing by Region</h4>
            <p className="expertForm__sectionHint">Set the price for each region. Leave blank to hide from clients in that country. At least one price is required.</p>

            <div className="expertForm__row expertForm__row--3">
              <label className="field">
                <span className="field__label">India <span className="field__currency">₹ INR</span></span>
                <input
                  className="field__input"
                  type="number"
                  min="0"
                  value={programForm.priceIN}
                  onChange={set("priceIN")}
                  placeholder="e.g. 33000"
                  disabled={isCreatingProgram}
                />
              </label>
              <label className="field">
                <span className="field__label">United Kingdom <span className="field__currency">£ GBP</span></span>
                <input
                  className="field__input"
                  type="number"
                  min="0"
                  value={programForm.priceUK}
                  onChange={set("priceUK")}
                  placeholder="e.g. 320"
                  disabled={isCreatingProgram}
                />
              </label>
              <label className="field">
                <span className="field__label">United States <span className="field__currency">$ USD</span></span>
                <input
                  className="field__input"
                  type="number"
                  min="0"
                  value={programForm.priceUS}
                  onChange={set("priceUS")}
                  placeholder="e.g. 400"
                  disabled={isCreatingProgram}
                />
              </label>
            </div>
          </div>

          {/* ── Section 7: Detail Section ─────────────────────────── */}
          <div className="expertForm__section">
            <h4 className="expertForm__sectionTitle">Detail Page Section <span className="field__optional">optional</span></h4>
            <p className="expertForm__sectionHint">A heading + description block shown on the program detail page, e.g. "Why This Works". You can add more after creation.</p>

            <label className="field">
              <span className="field__label">Section Heading</span>
              <input
                className="field__input"
                type="text"
                value={programForm.detailHeading}
                onChange={set("detailHeading")}
                placeholder="e.g. Why This Works"
                disabled={isCreatingProgram}
              />
            </label>

            <label className="field">
              <span className="field__label">Section Description</span>
              <textarea
                className="field__input expertForm__textarea expertForm__textarea--sm"
                value={programForm.detailDescription}
                onChange={set("detailDescription")}
                rows={3}
                placeholder="Explain this section in detail..."
                disabled={isCreatingProgram}
              />
            </label>
          </div>

          <div className="adminForm__actions">
            <button type="button" className="adminActionButton" onClick={onCloseModal} disabled={isCreatingProgram}>
              Cancel
            </button>
            <button type="submit" className="button" disabled={isCreatingProgram}>
              {editingProgramId
                ? isCreatingProgram ? "Updating…" : "Update Program"
                : isCreatingProgram ? "Creating…" : "Create Program"}
            </button>
          </div>
        </form>
      </section>
    </div>
  ) : null;

  return (
    <section className="adminPanel" role="tabpanel" aria-label="Programs">
      <div className="adminPanel__header">
        <h2 className="adminPanel__title">Programs</h2>
        <button type="button" className="button" onClick={onOpenAddModal}>
          Add Program
        </button>
      </div>

      {programCreateSuccess && <p className="adminPanel__success">{programCreateSuccess}</p>}

      <div className="adminForm__row adminForm__row--two">
        <label className="field">
          <span className="field__label">Filter by Domain</span>
          <select
            className="field__input"
            value={domainFilter}
            onChange={(e) => {
              const nextDomainFilter = e.target.value;
              setDomainFilter(nextDomainFilter);
              setCategoryFilter((prev) => {
                if (prev === "all") return prev;
                if (nextDomainFilter === "all") return prev;
                return categories.some(
                  (category) => category.id === prev && category.domainId === nextDomainFilter,
                )
                  ? prev
                  : "all";
              });
            }}
          >
            <option value="all">All domains</option>
            {domains.map((domain) => (
              <option key={domain.id} value={domain.id}>{domain.name}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Filter by Category</span>
          <select
            className="field__input"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All categories</option>
            {categoriesForFilter.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th>Program</th>
              <th>Domain</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrograms.length > 0 ? (
              filteredPrograms.map((program) => (
                <tr key={program.id}>
                  <td>{program.name}</td>
                  <td>{domains.find((domain) => domain.id === program.domainId)?.name ?? "—"}</td>
                  <td>{categories.find((category) => category.id === program.categoryId)?.name ?? "—"}</td>
                  <td>
                    <div className="adminActionGroup">
                      <button
                        type="button"
                        className="adminActionButton"
                        onClick={() => onStartEdit(program)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="adminActionButton adminActionButton--danger"
                        onClick={() => onDelete(program.id)}
                        disabled={deletingProgramId === program.id}
                      >
                        {deletingProgramId === program.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="adminTable__empty">No programs match the selected filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {programModal &&
        (typeof document !== "undefined"
          ? createPortal(programModal, document.body)
          : programModal)}
    </section>
  );
}
