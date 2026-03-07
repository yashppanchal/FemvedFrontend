import type { FormEvent } from "react";
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
  const programModal = isProgramModalOpen ? (
    <div className="adminModalBackdrop" role="presentation">
      <section
        className="adminModal"
        role="dialog"
        aria-modal="true"
        aria-label={editingProgramId ? "Edit program" : "Create program"}
      >
        <div className="adminModal__header">
          <h3 className="adminModal__title">
            {editingProgramId ? "Edit Program" : "Add Program"}
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
          <div className="adminForm__row adminForm__row--two">
            <label className="field">
              <span className="field__label">Domain</span>
              <select
                className="field__input"
                value={programForm.domainId}
                onChange={(e) =>
                  onProgramFormChange((prev) => ({
                    ...prev,
                    domainId: e.target.value,
                    categoryId: "",
                  }))
                }
                required
              >
                <option value="">Select domain</option>
                {domains.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field__label">Category</span>
              <select
                className="field__input"
                value={programForm.categoryId}
                onChange={(e) =>
                  onProgramFormChange((prev) => ({
                    ...prev,
                    categoryId: e.target.value,
                  }))
                }
                required
                disabled={!programForm.domainId}
              >
                <option value="">
                  {programForm.domainId ? "Select category" : "Select domain first"}
                </option>
                {categoriesForProgramDomain.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="adminForm__row">
            <label className="field">
              <span className="field__label">Program Name</span>
              <input
                className="field__input"
                type="text"
                value={programForm.name}
                onChange={(e) =>
                  onProgramFormChange((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Program name"
                required
              />
            </label>
          </div>

          <div className="adminForm__row adminForm__row--two">
            <label className="field">
              <span className="field__label">Grid Description</span>
              <input
                className="field__input"
                type="text"
                value={programForm.gridDescription}
                onChange={(e) =>
                  onProgramFormChange((prev) => ({
                    ...prev,
                    gridDescription: e.target.value,
                  }))
                }
                placeholder="Shown on listing cards"
                required
              />
            </label>
            <label className="field">
              <span className="field__label">Grid Image URL</span>
              <input
                className="field__input"
                type="url"
                value={programForm.gridImageUrl}
                onChange={(e) =>
                  onProgramFormChange((prev) => ({
                    ...prev,
                    gridImageUrl: e.target.value,
                  }))
                }
                placeholder="https://..."
                required
              />
            </label>
          </div>

          <div className="adminForm__row adminForm__row--two">
            <label className="field">
              <span className="field__label">Overview</span>
              <textarea
                className="field__input"
                value={programForm.overview}
                onChange={(e) =>
                  onProgramFormChange((prev) => ({
                    ...prev,
                    overview: e.target.value,
                  }))
                }
                rows={4}
                placeholder="Program overview"
                required
              />
            </label>

            <label className="field">
              <span className="field__label">Sort Order</span>
              <input
                className="field__input"
                type="number"
                min={0}
                step={1}
                value={programForm.sortOrder}
                onChange={(e) =>
                  onProgramFormChange((prev) => ({
                    ...prev,
                    sortOrder: e.target.value,
                  }))
                }
              />
            </label>
          </div>

          <div className="adminForm__row adminForm__row--two">
            <label className="field">
              <span className="field__label">Duration Label</span>
              <input
                className="field__input"
                type="text"
                value={programForm.durationLabel}
                onChange={(e) =>
                  onProgramFormChange((prev) => ({
                    ...prev,
                    durationLabel: e.target.value,
                  }))
                }
                placeholder="e.g., 12 Weeks"
                required
              />
            </label>
            <label className="field">
              <span className="field__label">Duration Weeks</span>
              <input
                className="field__input"
                type="number"
                min={0}
                step={1}
                value={programForm.durationWeeks}
                onChange={(e) =>
                  onProgramFormChange((prev) => ({
                    ...prev,
                    durationWeeks: e.target.value,
                  }))
                }
                required
              />
            </label>
          </div>

          <div className="adminForm__row adminForm__row--two">
            <label className="field">
              <span className="field__label">Duration Sort Order</span>
              <input
                className="field__input"
                type="number"
                min={0}
                step={1}
                value={programForm.durationSortOrder}
                onChange={(e) =>
                  onProgramFormChange((prev) => ({
                    ...prev,
                    durationSortOrder: e.target.value,
                  }))
                }
              />
            </label>
            <label className="field">
              <span className="field__label">Location Code</span>
              <input
                className="field__input"
                type="text"
                value={programForm.locationCode}
                onChange={(e) =>
                  onProgramFormChange((prev) => ({
                    ...prev,
                    locationCode: e.target.value,
                  }))
                }
                placeholder="IN"
                required
              />
            </label>
          </div>

          <div className="adminForm__row adminForm__row--two">
            <label className="field">
              <span className="field__label">Amount</span>
              <input
                className="field__input"
                type="number"
                min={0}
                step={0.01}
                value={programForm.amount}
                onChange={(e) =>
                  onProgramFormChange((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
                required
              />
            </label>
            <label className="field">
              <span className="field__label">Currency Code</span>
              <input
                className="field__input"
                type="text"
                value={programForm.currencyCode}
                onChange={(e) =>
                  onProgramFormChange((prev) => ({
                    ...prev,
                    currencyCode: e.target.value,
                  }))
                }
                placeholder="INR"
                required
              />
            </label>
          </div>

          <div className="adminForm__row adminForm__row--two">
            <label className="field">
              <span className="field__label">Currency Symbol</span>
              <input
                className="field__input"
                type="text"
                value={programForm.currencySymbol}
                onChange={(e) =>
                  onProgramFormChange((prev) => ({
                    ...prev,
                    currencySymbol: e.target.value,
                  }))
                }
                placeholder="Rs"
                required
              />
            </label>
          </div>

          <div className="adminForm__row adminForm__row--two">
            <label className="field">
              <span className="field__label">
                What You Get (one per line or comma-separated)
              </span>
              <textarea
                className="field__input"
                value={programForm.whatYouGet}
                onChange={(e) =>
                  onProgramFormChange((prev) => ({
                    ...prev,
                    whatYouGet: e.target.value,
                  }))
                }
                rows={4}
                placeholder={"Meal plan\nDedicated coach"}
              />
            </label>
            <label className="field">
              <span className="field__label">
                Who Is This For (one per line or comma-separated)
              </span>
              <textarea
                className="field__input"
                value={programForm.whoIsThisFor}
                onChange={(e) =>
                  onProgramFormChange((prev) => ({
                    ...prev,
                    whoIsThisFor: e.target.value,
                  }))
                }
                rows={4}
                placeholder={"PCOS\nIrregular cycles"}
              />
            </label>
          </div>

          <div className="adminForm__row adminForm__row--two">
            <label className="field">
              <span className="field__label">
                Tags (one per line or comma-separated)
              </span>
              <textarea
                className="field__input"
                value={programForm.tags}
                onChange={(e) =>
                  onProgramFormChange((prev) => ({
                    ...prev,
                    tags: e.target.value,
                  }))
                }
                rows={3}
                placeholder={"pcos\nhormones"}
              />
            </label>
          </div>

          <div className="adminForm__row adminForm__row--two">
            <label className="field">
              <span className="field__label">Detail Section Heading</span>
              <input
                className="field__input"
                type="text"
                value={programForm.detailHeading}
                onChange={(e) =>
                  onProgramFormChange((prev) => ({
                    ...prev,
                    detailHeading: e.target.value,
                  }))
                }
                placeholder="Why this works"
              />
            </label>
            <label className="field">
              <span className="field__label">Detail Section Sort Order</span>
              <input
                className="field__input"
                type="number"
                min={0}
                step={1}
                value={programForm.detailSortOrder}
                onChange={(e) =>
                  onProgramFormChange((prev) => ({
                    ...prev,
                    detailSortOrder: e.target.value,
                  }))
                }
              />
            </label>
          </div>

          <div className="adminForm__row">
            <label className="field">
              <span className="field__label">Detail Section Description</span>
              <textarea
                className="field__input"
                value={programForm.detailDescription}
                onChange={(e) =>
                  onProgramFormChange((prev) => ({
                    ...prev,
                    detailDescription: e.target.value,
                  }))
                }
                rows={4}
                placeholder="Explain this section"
              />
            </label>
          </div>

          <div className="adminForm__actions">
            <button type="submit" className="button" disabled={isCreatingProgram}>
              {editingProgramId
                ? isCreatingProgram
                  ? "Updating Program..."
                  : "Update Program"
                : isCreatingProgram
                  ? "Adding Program..."
                  : "Add Program"}
            </button>
            <button
              type="button"
              className="adminActionButton"
              onClick={onCloseModal}
              disabled={isCreatingProgram}
            >
              Cancel
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
            {programs.length > 0 ? (
              programs.map((program) => (
                <tr key={program.id}>
                  <td>{program.name}</td>
                  <td>
                    {domains.find((domain) => domain.id === program.domainId)?.name ?? "-"}
                  </td>
                  <td>
                    {categories.find((category) => category.id === program.categoryId)
                      ?.name ?? "-"}
                  </td>
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
                        {deletingProgramId === program.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="adminTable__empty">
                  No programs yet. Add one to begin.
                </td>
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
